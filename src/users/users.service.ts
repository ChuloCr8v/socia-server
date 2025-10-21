import { Inject, Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { CreateUserDto } from 'src/auth/auth.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { bad } from 'src/utils/error.utils';
import { isEmailTaken, isPhoneTaken, generateOtp } from 'src/utils/helpers.utils';
import { EmailQueue } from '../email/email.queue.js';
import { OtpService } from '../otp/otp.service.js';

@Injectable()
export class UsersService {

    constructor(
        private emailQueue: EmailQueue,
        private prismaService: PrismaService,
        private otpService: OtpService
    ) { }

    async listUsers() {
        try {
            const users = await this.prismaService.user.findMany()
            return users
        } catch (error) {
            console.log(error)
            bad(error)

        }
    }

    async findUser(email: string) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    email
                },

            })

            if (!user) return bad("User not found")
            return user
        } catch (error) {
            console.log(error)
            bad(error)

        }
    }


    async createUser(dto: CreateUserDto) {

        if (await isEmailTaken(dto.email)) bad('Email already exists');

        const passHash = await hash(dto.password);

        const { otp, hashedOtp } = await generateOtp();

        const user = await this.prismaService.user.create({
            data: { email: dto.email, userName: dto.userName, auth: { create: { passHash } } },
        });


        await this.prismaService.otp.create({
            data: {
                otp: hashedOtp,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                type: 'EMAIL_VERIFICATION',
                user: {
                    connect: {
                        email: dto.email,
                    },
                },
            },
        });

        // Send OTP email
        await this.emailQueue.enqueueOtpEmail(dto.email, otp, dto.userName);

        return user;
    }

    async verfyUserOtp(email: string) {
        try {
            const user = await this.prismaService.user.findUnique({ where: { email } });
            if (!user) bad('Account not found');

            const { otp, hashedOtp } = await generateOtp();

            await this.prismaService.otp.create({
                data: {
                    otp: hashedOtp,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
                    type: "ACCOUNT_VERIFICATION",
                    user: {
                        connect: { email },
                    },
                },
            });


            await this.emailQueue.enqueueOtpEmail(email, otp, user.userName);

            return { message: 'OTP sent', data: user };
        } catch (error: any) {
            console.log('error issue:', error);
            return error.message || 'An unexpected error occurred.';
        }
    }

    async verifyUserAccount(dto: { email: string, otp: string }) {
        const { email, otp } = dto
        try {
            const user = await this.prismaService.user.findUnique({ where: { email } });
            if (!user) bad('Account not found');

            await this.otpService.verifyOtp(user.id, otp)

            await this.prismaService.user.update({
                where: { email },
                data: { isVerified: true },
            });

            await this.emailQueue.enqueueVerifyAccount(email, user.userName);
            console.log({
                message: "Account Verification Successful",
                user

            })
            return {
                message: "Account Verification Successful",
                user

            }

        } catch (error: any) {
            console.log('error issue:', error);
            return error.message || 'An unexpected error occurred.';
        }
    }
    async createExpoPushToken(userId: string, token: string) {
        try {
            const user = await this.prismaService.user.findUnique({ where: { id: userId } });
            if (!user) return { success: false, message: 'User not found' };

            const existingTokens = user.expoPushTokens || [];
            if (!existingTokens.includes(token)) {
                existingTokens.push(token);
            }

            const updatedUser = await this.prismaService.user.update({
                where: { id: userId },
                data: {
                    expoPushTokens: existingTokens,
                },
            });

            return { success: true, data: updatedUser };
        } catch (error) {
            console.error('Error saving push token:', error);
            return { success: false, message: 'Failed to save push token', error };
        }
    }

}
