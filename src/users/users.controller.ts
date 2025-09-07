import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/auth/auth.types';

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
}
