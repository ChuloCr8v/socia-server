import { Body, Controller, Post, Put, Req, UseGuards, Get, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OtpService } from '../otp/otp.service.js';
import { AuthService } from './auth.service.js';
import { LoginDto, IAuthUser, validateUserDto } from './auth.types.js';
import { Auth, AuthUser } from './decorators/auth.decorator.js';
import { OtpTypes } from '../../generated/prisma/index.js';
@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService,
        private otp: OtpService
    ) { }

    // admin login
    // @Auth(Role.ADMIN)
    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.auth.validateUser(body.email, body.password);
        return this.auth.login(user);
    }

    @Post('google')
    async googleAuth(@Body() body: { email: string, googleId: string, name: string }) {
        return this.auth.googleLogin(body)
    }

    @Post("generate-otp")
    generateOtp(@Body() dto: { email: string, type: OtpTypes }) {
        return this.auth.generateOtp(dto)
    }

    @Post("apple")
    async appleAuth(@Body() body: { identityToken: string }) {
        return this.auth.appleSignin(body.identityToken)
    }

    @Get("me")
    @Auth()
    async getAuthUser(@AuthUser() user: IAuthUser) {
        return this.auth.authUser(user)
    }

    @Post("forgot-password")
    async forgotPassword(@Body() dto: { email: string }) {
        const { email } = dto
        return this.auth.forgotPassword(email)
    }

    @Put("reset-password")
    async resetPassword(@Body() dto: LoginDto) {
        await this.auth.resetPassword(dto)
    }

    @Put("verify-otp")
    async verifyOTP(@Body() dto: validateUserDto) {
        const { email, otp } = dto
        return await this.auth.verifyOtp(email, otp)
    }

}
