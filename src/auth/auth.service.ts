import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify as verifyHash } from 'argon2';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { Role, User } from '@prisma/client';
import { EmailQueue } from '../email/email.queue.js';
import { OtpService } from '../otp/otp.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { bad } from '../utils/error.utils.js';
import { generateOtp } from '../utils/helpers.utils.js';
import { LoginDto, IAuthUser } from './auth.types.js';

const APPLE_ISSUER = 'https://appleid.apple.com';

const client = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys',
});

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private emailQueue: EmailQueue,
        private otp: OtpService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { auth: true },
        });


        if (!user || !(await verifyHash(user.auth?.passHash || '', password))) {
            bad('Invalid credentials');
        }

        return user;
    }

    async login(user: User) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            accessToken: this.jwt.sign(payload),
            user,
        };
    }

    async googleLogin(googleProfile: LoginDto) {
        const { googleId, email, name } = googleProfile;

        const existingAuth = await this.prisma.auth.findFirst({
            where: {
                provider: 'GOOGLE',
                providerId: googleId,
            },
            select: { user: true },
        });

        let user = existingAuth?.user;

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    name,
                    phone: user.phone ?? "",
                    auth: {
                        create: {
                            provider: 'GOOGLE',
                            providerId: googleId,
                        },
                    },
                },
            });
        }

        const token = this.jwt.sign({ userId: user.id, email: user.email });

        return {
            message: 'Logged in with Google',
            user,
            token,
        };
    }

    async verifyAppleIdentityToken(idToken: string): Promise<any> {
        const decoded = this.jwt.decode(idToken, { complete: true });

        if (!decoded || typeof decoded === 'string') {
            throw new Error('Invalid token structure');
        }

        const { header } = decoded;
        const publicKey = await this.getAppleSigningKey(header.kid);

        return jwt.verify(idToken, publicKey, {
            algorithms: ['RS256'],
            issuer: APPLE_ISSUER,
        });
    }

    private getAppleSigningKey(kid: string): Promise<string> {
        return new Promise((resolve, reject) => {
            client.getSigningKey(kid, (err, key) => {
                if (err) return reject(err);
                const signingKey = key.getPublicKey();
                resolve(signingKey);
            });
        });
    }

    async appleSignin(identityToken: string) {
        const payload = await this.verifyAppleIdentityToken(identityToken);
        const appleId = payload.sub;
        const email = payload.email ?? null;

        let existingAuth = await this.prisma.auth.findFirst({
            where: {
                provider: 'APPLE',
                providerId: appleId,
            },
            include: {
                user: true,
            },
        });

        let user: User;

        if (!existingAuth) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    name: '',
                    isVerified: true,
                    phone: "",
                    auth: {
                        create: {
                            provider: 'APPLE',
                            providerId: appleId,
                        },
                    },
                },
            });
        } else {
            user = existingAuth.user;
        }

        const accessToken = this.jwt.sign({ userId: user.id, email: user.email });

        return {
            message: 'Logged in with Apple',
            firstLogin: !existingAuth,
            user,
            accessToken,
        };
    }

    async authUser(user: IAuthUser) {
        return this.prisma.user.findUnique({
            where: { id: user.sub || user.userId },
            include: {
                vendor: {
                    include: {
                        logo: true,
                        headerImage: true,
                        profileImage: true,
                        operatingHour: true
                    }

                }
            }
        });
    }

    async forgotPassword(email: string) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) bad('Account not found');

            const { otp, hashedOtp } = await generateOtp();

            await this.prisma.otp.create({
                data: {
                    otp: hashedOtp,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
                    type: 'RESET_PASSWORD',
                    user: {
                        connect: { email },
                    },
                },
            });


            await this.emailQueue.enqueueResetPasswordOtp(email, otp, user.name);

            return { message: 'OTP sent', data: user };
        } catch (error: any) {
            console.log('error issue:', error);
            return error.message || 'An unexpected error occurred.';
        }
    }

    async resetPassword(dto: LoginDto) {
        try {
            const { password, email } = dto;

            const user = await this.prisma.user.findUnique({
                where: { email },
                include: { auth: true },
            });

            if (!user) bad('Account not found');

            const isOldPassword = await verifyHash(user.auth.passHash, password);
            if (isOldPassword) bad("You can't use old password!");

            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    auth: {
                        update: {
                            passHash: await hash(password),
                        },
                    },
                },
            });

            await this.emailQueue.enqueueResetPasswordSuccessful(email, user.name);
            return { message: 'Password reset successful' };
        } catch (error: any) {
            console.log(error);
            return error.message || 'An unexpected error occurred.';
        }
    }

    async verifyOtp(email: string, otp: string) {
        const user = await this.prisma.user.findFirst({ where: { email } });
        if (!user) return bad('Account does not exist!');

        await this.otp.verifyOtp(user.id, otp);

        return {
            message: 'OTP verified successfully',
            data: user,
        };
    }



    generateToken(user: { id: string; email: string; role: Role }) {
        return this.jwt.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
    }



}
