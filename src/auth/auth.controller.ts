import { Body, Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IAuthUser, LoginDto } from './auth.types';
import { AuthUser } from './decorators/auth.decorator';
@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) { }

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





}
