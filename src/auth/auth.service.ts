import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify as verifyHash } from 'argon2';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { OtpTypes, Role, User } from '@prisma/client';
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
        // 1️⃣ Find user with all auth methods
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { auth: true },
        });

        if (!user) bad('Invalid credentials');

        // 2️⃣ Locate the local/password-based auth record
        const localAuth = user.auth.find(
            (a) => !a.provider || a.provider === 'PASSWORD'
        );

        if (!localAuth?.passHash) {
            if (user.auth.some(a => a.provider === "APPLE")) return bad("Login with your apple account")
            if (user.auth.some(a => a.provider === "GOOGLE")) return bad("Login with your google account")

            bad('Account does not support password login');
        }

        // 3️⃣ Verify password hash
        const isValid = await verifyHash(localAuth.passHash, password);
        if (!isValid) bad('Invalid credentials');

        // 4️⃣ Return user if valid
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

        // 1️⃣ Check if user exists by email
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
            include: { auth: true },
        });

        // 2️⃣ If user exists and already linked with Google → login
        const googleAuth = existingUser?.auth.find(
            (a) => a.provider === 'GOOGLE' && a.providerId === googleId
        );

        if (googleAuth) {
            const token = this.jwt.sign({ userId: existingUser.id, email: existingUser.email });
            return {
                message: 'Logged in with Google',
                user: existingUser,
                token,
            };
        }

        // 3️⃣ If user exists but not linked with Google yet → link and login
        if (existingUser) {
            // Check if already linked with Google under another providerId (edge case)
            const alreadyLinked = existingUser.auth.some((a) => a.provider === 'GOOGLE');
            if (!alreadyLinked) {
                await this.prisma.auth.create({
                    data: {
                        provider: 'GOOGLE',
                        providerId: googleId,
                        userId: existingUser.id,
                    },
                });
            }

            const token = this.jwt.sign({ userId: existingUser.id, email: existingUser.email });
            return {
                message: alreadyLinked
                    ? 'Google already linked — logged in'
                    : 'Google account linked and logged in',
                user: existingUser,
                token,
            };
        }

        // 4️⃣ If Google auth exists but user somehow not found (edge case)
        const existingAuth = await this.prisma.auth.findFirst({
            where: { provider: 'GOOGLE', providerId: googleId },
            include: { user: true },
        });

        if (existingAuth?.user) {
            const token = this.jwt.sign({ userId: existingAuth.user.id, email: existingAuth.user.email });
            return {
                message: 'Logged in with Google',
                user: existingAuth.user,
                token,
            };
        }

        // 5️⃣ New user → create both user and linked Google auth
        const newUser = await this.prisma.user.create({
            data: {
                email,
                name,
                isVerified: true,
                auth: {
                    create: {
                        provider: 'GOOGLE',
                        providerId: googleId,
                    },
                },
            },
            include: { auth: true },
        });

        const token = this.jwt.sign({ userId: newUser.id, email: newUser.email });

        return {
            message: 'New Google user created',
            user: newUser,
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
        return await this.prisma.user.findUnique({
            where: { id: user.sub || user.userId },

        });
    }

    async generateOtp(dto: { email: string, type: OtpTypes }) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email: dto.email
                }
            })

            if (!user) bad("User not found")

            await this.otp.generateOtp({ email: dto.email, userName: user.userName, type: dto.type })
            return { message: "OTP successfully generated" }
        } catch (error) {
            bad(error.message)
        }
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

            // Find the local/password-based auth record
            const localAuth = user.auth.find(
                (a) => a.provider === 'PASSWORD' || a.provider === null
            );

            if (!localAuth) bad('This account uses an external login method. Please sign in with Google or Apple.');

            // Check if user is trying to reuse the same password
            const isOldPassword = await verifyHash(localAuth.passHash, password);
            if (isOldPassword) bad("You can't use your old password!");

            // Update the password hash for the correct auth record
            await this.prisma.auth.update({
                where: { id: localAuth.id },
                data: { passHash: await hash(password) },
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
