import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { bad } from 'src/utils/error.utils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isAfter } from 'date-fns';
import * as argon from 'argon2';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);

    constructor(private prisma: PrismaService) { }

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

            const isOtpValid = await argon.verify(getOtp.otp, otp);
            if (!isOtpValid) bad('Invalid OTP');

            await this.prisma.otp.delete({ where: { id: getOtp.id } });
            return true;
        } catch (error: any) {
            this.logger.error('OTP verification failed', error);
            bad(error?.message || 'An unexpected error occurred.');
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
