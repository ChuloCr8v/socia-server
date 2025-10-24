import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isAfter } from 'date-fns';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { bad } from '../utils/error.utils.js';
import { EmailQueue } from '../email/email.queue.js';
import { OtpTypes } from '@prisma/client';
import { generateOtp } from '../utils/helpers.utils.js';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);

    constructor(private prisma: PrismaService, private emailQueue: EmailQueue) { }

    async verifyOtp(userId: string, otp: string) {
        try {
            const getOtp = await this.prisma.otp.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });

            if (!getOtp) bad('OTP not found!');

            if (isAfter(new Date(), getOtp.expiresAt)) {
                await this.prisma.otp.delete({ where: { id: getOtp.id } });
                bad('OTP has expired!');
            }

            const cleanOtp = String(otp).trim();


            const isOtpValid = await argon.verify(getOtp.otp, cleanOtp);
            if (!isOtpValid) bad('Invalid OTP');

            await this.prisma.otp.delete({ where: { id: getOtp.id } });

            return true;
        } catch (error: any) {
            this.logger.error('OTP verification failed', error);
            bad(error?.message || 'An unexpected error occurred.');
        }
    }

    async generateOtp(dto: { email: string, userName: string, type: OtpTypes }) {
        try {
            const { otp, hashedOtp } = await generateOtp();


            await this.prisma.otp.create({
                data: {
                    otp: hashedOtp,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                    type: dto.type,
                    user: {
                        connect: {
                            email: dto.email,
                        },
                    },
                },
            });

            // Send OTP email
            await this.emailQueue.enqueueOtpEmail(dto.email, otp, dto.userName);
        } catch (error) {
            bad(error.data.message)
        }
    }


    /**
     * Deletes expired OTPs every day at midnight
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteExpiredOtps() {
        this.logger.verbose('Deleting expired OTPs');

        const deleted = await this.prisma.otp.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });

        this.logger.verbose(`Expired OTPs deleted: ${deleted.count}`);
    }
}
