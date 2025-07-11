import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { bad } from 'src/utils/error.utils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isAfter } from 'date-fns';
import * as argon from "argon2"



@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);

    constructor(private prisma: PrismaService) { }

    async verifyOtp(userId: string, otp: string) {
        console.log(userId)
        try {
            const getOtp = await this.prisma.otp.findFirst({ where: { userId } });
            if (!getOtp) return bad("OTP not found!");

            if (isAfter(new Date(), getOtp.expiresAt)) {
                await this.prisma.otp.delete({ where: { id: getOtp.id } });
                return bad("OTP has expired!");
            }

            const isOtpValid = await argon.verify(getOtp.otp, otp);
            if (!isOtpValid) return bad("Invalid OTP");

            await this.prisma.otp.delete({ where: { id: getOtp.id } });
            return true;
        } catch (error: any) {
            console.error("OTP verification failed:", error);
            return bad(error?.message || "An unexpected error occurred.");
        }
    }


    // Delete all expired OTPs every 24hrs
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteExpiredOtps() {
        this.logger.verbose('Deleting expired OTPs');
        const otps = await this.prisma.otp.findMany();

        for (let otp of otps) {
            if (isAfter(new Date(), otp.expiresAt)) {
                await this.prisma.otp.delete({ where: { id: otp.id } });
            }
        }
    }

}
