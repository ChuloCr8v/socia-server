import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
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


}
