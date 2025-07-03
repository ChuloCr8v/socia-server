import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { bad } from 'src/utils/error.utils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isAfter } from 'date-fns';



@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);

    constructor(private prisma: PrismaService) { }

    async verifyOtp(userId: string) {

        const user = await this.prisma.user.findUnique({ where: { id: userId } })
        const getOtp = await this.prisma.otp.findFirst({ where: { userId } })

        if (!user) return bad("Account does not exist!")
        if (!getOtp) return bad("Otp not found!")
        if (isAfter(new Date(), getOtp.expiresAt)) {
            await this.prisma.otp.delete({ where: { id: getOtp.id } })
            return bad("OTP has expired!")
        }

        await this.prisma.otp.delete({ where: { id: getOtp.id } });
        return true
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
