import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AddUserDTO } from './types.js';
import { Auth } from '../auth/decorators/auth.decorator.js';

@Controller('admin')
export class AdminController {
    constructor(private admin: AdminService) { }

    @Auth()
    @Post("")
    async addUser(@Body() dto: AddUserDTO, addedBy: string) {
        return this.admin.addUser(dto, addedBy)
    }

    @Auth()
    @Patch("user/:id")
    async updateUser(@Param("id") id: string, @Body() dto: AddUserDTO) {
        return this.admin.updateUser(dto, id)
    }

    @Auth()
    @Patch("user/suspend/:id")
    async suspendUser(@Param("id") id: string) {
        return this.admin.suspendUser(id)
    }

    @Auth()
    @Get("users")
    async listUsers() {
        return this.admin.listUsers()
    }

    @Auth()
    @Get("user/:id")
    async getUser(@Param("id") id: string) {
        return this.admin.getUser(id)
    }

    @Auth()
    @Delete("users")
    async deleteUser(@Body() dto: { id: string }) {
        return this.admin.deleteUser(dto)
    }


}
