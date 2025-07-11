import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { bad } from 'src/utils/error.utils';
import { IAuthUser, LoginDto } from './auth.types';

import * as jwt from 'jsonwebtoken';

import jwksClient from 'jwks-rsa';
import { User } from 'generated/prisma';

const APPLE_ISSUER = 'https://appleid.apple.com';

const client = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys',
});


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,

    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { auth: true },
        });

        if (!user || !(await argon.verify(user.auth?.passHash || '', password))) {
            bad('Invalid credentials');
        }

        return user;
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            accessToken: this.jwt.sign(payload),
            user,
        };
    }


    async googleLogin(googleProfile: LoginDto) {

        const { googleId, email, name } = googleProfile

        const existingAuth = await this.prisma.auth.findFirst({
            where: {
                provider: "GOOGLE",
                providerId: googleId

            },
            select: {
                user: true
            }
        })

        let user = existingAuth.user

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    name,
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
            token: token,
        };
    }

    async verifyAppleIdentityToken(idToken: string): Promise<any> {
        const decoded = this.jwt.decode(idToken, { complete: true });

        if (!decoded || typeof decoded === 'string') {
            throw new Error('Invalid token structure');
        }

        const { header } = decoded;
        const publicKey = await this.getAppleSigningKey(header.kid);

        try {
            const payload = jwt.verify(idToken, publicKey, {
                algorithms: ['RS256'],
                issuer: APPLE_ISSUER,
            });
            return payload;
        } catch (err) {
            throw err;
        }
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
                user: true
            }
        });


        let user: User;

        if (!existingAuth) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    name: '',
                    auth: {
                        create: {
                            provider: 'APPLE',
                            providerId: appleId,
                        },
                    },
                },
            });
        } else {
            user = existingAuth.user
        }

        const token = this.jwt.sign({ userId: user.id, email: user.email });


        return {
            message: 'Logged in with Apple',
            user,
            token,
        };
    }


    async authUser(user: IAuthUser) {
        return this.prisma.user.findUnique({
            where: { id: user.sub },
        });
    }


}

