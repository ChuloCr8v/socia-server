import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';
import { OrderService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './types';
import { OrderStatus } from '@prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
@Controller('orders')


export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    // ✅ Create new order (authenticated user)
    @Post()
    @Auth()
    async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
        const userId = req.user.id;
        return this.orderService.createOrder(dto, userId);
    }

    // ✅ Get all orders for logged-in user
    @Get()
    @Auth()
    async getUserOrders(@Req() req: any) {
        return this.orderService.getUserOrders(req.user.id);
    }

    @Auth()
    @Get(":orderId")
    async getOrder(@Param("orderId") orderId: string) {
        return this.orderService.getOrder(orderId);
    }

    // ✅ Vendor/Admin can update order status
    @Patch(':id/status')
    async updateOrderStatus(
        @Param('id') id: string,
        @Body() body: UpdateOrderStatusDto,
    ) {
        return this.orderService.updateOrderStatus(
            id,
            body.status as OrderStatus,
        );
    }
}
