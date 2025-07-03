import { Injectable } from '@nestjs/common';
import { OtpService } from 'src/otp/otp.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        // private otp: OtpService
    ) { }


    // async verifyOtp(userId: string, otp: string) {
    //     await this.otp.verifyOtp(userId, otp)
    // }

}

