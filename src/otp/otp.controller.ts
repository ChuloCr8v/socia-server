import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpTypes } from 'generated/prisma';

@Controller('otp')
export class OtpController {

    constructor(private otp: OtpService) { }

    @Post("generate")
    generateOtp(@Body() dto: { email: string, otp: string, userName: string, type: OtpTypes }) {
        return this.otp.generateOtp(dto)
    }
}
