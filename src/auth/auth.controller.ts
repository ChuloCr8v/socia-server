import { Body, Controller, Post, Put, Req, UseGuards, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IAuthUser, LoginDto, validateUserDto } from './auth.types';
import { AuthUser } from './decorators/auth.decorator';
import { OtpService } from 'src/otp/otp.service';
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
    @UseGuards(AuthGuard('google-token'))
    async googleAuth(@Req() req: { user: LoginDto }) {
        const user = req.user;
        return this.auth.googleLogin(user)
    }

    @Post("apple")
    async appleAuth(@Body() body: { identityToken: string }) {
        return this.auth.appleSignin(body.identityToken)
    }

    @Get("auth-user")
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
