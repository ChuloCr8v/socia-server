import { Body, Controller, Post, Get, Delete, Put, Param, Patch } from '@nestjs/common';
import { CreateVendorDto, UpdateVendorDto, validateUserDto } from '../auth/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VendorsService } from './vendors.service.js';

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

    // @Auth("ADMIN")
    @Get()
    async listAllVendors() {
        return this.vendor.listVendors()
    }

    @Get(":id")
    async getVendor(@Param("id") id: string) {
        return this.vendor.getVendor(id)
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

    @Put("verify")
    async verifyVendor(@Body() dto: validateUserDto) {
        const { email, otp } = dto
        return this.vendor.verifyVendor(email, otp)
    }

    @Put("update-business-category/:id")
    async updateBusinessCategory(@Param("id") id: string, @Body() dto: { businessCategory: string }) {
        const { businessCategory } = dto
        return this.vendor.updateBusinessCategory(id, businessCategory)
    }

    @Put("update-vendor/:id")
    async updateVendor(@Param("id") id: string, @Body() dto: UpdateVendorDto) {
        return this.vendor.updateVendor(id, dto)
    }


    @Patch("update-business-profile-picture/:id")
    async updateBusinessProfilePicture(@Param("id") id: string, @Body() dto: { imageId: string }) {
        console.log('updateDto', dto);

        return this.vendor.updateBusinessProfilePicture(id, dto.imageId)
    }
}
