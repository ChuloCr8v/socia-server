import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
    ) { }


    @Get("")
    async listUsers() {
        return this.usersService.listUsers()
    }

    @Get("user/email")
    async findUserByEmail(@Body() id: string) {
        return this.usersService.findUser(id)
    }

    @Post("")
    async createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto)
    }

    @Post("verify")
    async SendVerifcationOTP(@Body() dto: { email: string }) {
        return this.usersService.verfyUserOtp(dto.email)
    }

    @Put("verify/account")
    async verifyUserAccount(@Body() dto: { email: string, otp: string }) {
        return this.usersService.verifyUserAccount(dto)
    }

    @Auth()
    @Post('push-token')
    async savePushToken(@Body() body: { token: string }, @Req() req) {
        const userId = req.user.id;
        return this.usersService.createExpoPushToken(userId, body.token);
    }
}

