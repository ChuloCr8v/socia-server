import { Body, Controller, Post, Get, Delete, Put, Param, UseGuards } from '@nestjs/common';
import { CreateVendorDto } from 'src/auth/auth.types';
import { VendorsService } from './vendors.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('vendors')
export class VendorsController {

    constructor(
        private vendor: VendorsService,
        private prisma: PrismaService
    ) { }

    @Post()
    async createVendor(@Body() vendorDto: CreateVendorDto) {
        return await this.vendor.createVendor(vendorDto)
    }

    @Auth("ADMIN")
    @Get()
    async listAllVendors() {
        return this.vendor.listVendors()
    }

    @Delete(':id')
    async deleteVendor(@Param('id') id: string) {
        await this.prisma.$transaction(async prisma => {
            // Delete Auth
            await prisma.auth.delete({ where: { userId: id } });

            // Delete Vendor
            await prisma.vendor.delete({ where: { userId: id } });

            // Delete OTPs
            await prisma.otp.deleteMany({ where: { userId: id } });

            // Finally delete the User
            await prisma.user.delete({ where: { id } });
        });

        return { message: 'Vendor deleted successfully' };
    }

    @Put("verify/:userId")
    async verifyVendor(@Param("userId") userId: string, @Body() otp: string) {
        return this.vendor.verifyVendor(userId, otp)
    }
}
