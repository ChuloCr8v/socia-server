import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateMenuDto } from 'src/vendors/types/menu';
import { MenuService } from './menu.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('menu')
export class MenuController {
    constructor(private menu: MenuService) { }

    @Post('categories')
    async createCategory(
        @Body() dto: { name: string; description: string; image?: string }
    ) {
        return this.menu.createCategory(dto);
    }

    @Get('categories')
    async getCategories() {
        return this.menu.getCategories();
    }

    @Put('availability/:id')
    async toggleMenuAvailability(@Param('id') id: string) {
        return this.menu.toggleMenuAvailability(id);
    }

    @Auth()
    @Post(':id')
    async createMenu(@Param('id') id: string, @Body() dto: CreateMenuDto) {
        return this.menu.createMenu(id, dto);
    }

    @Get(':id')
    async getMenu(@Param('id') id: string) {
        return this.menu.getMenu(id);
    }

    @Get('vendor/:vendorId')
    async listMenu(@Param('vendorId') vendorId: string) {
        return this.menu.listMenu(vendorId);
    }

    @Put('edit/:id')
    async updateMenu(@Param("id") id: string, @Body() dto: CreateMenuDto) {
        return this.menu.updateMenu(id, dto)
    }

    @Delete(":id")
    async(@Param("id") id: string) {
        return this.menu.deleteMenu(id)
    }
}
