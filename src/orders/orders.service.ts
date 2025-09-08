import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailQueue } from '../email/email.queue.js';
import { OrderGateway } from './order.gateway';
import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './types';

@Injectable()
export class OrderService {
    constructor(
        private prisma: PrismaService,
        private emailQueue: EmailQueue,
        private orderGateway: OrderGateway,
    ) { }

    async createOrder(dto: CreateOrderDto, userId: string) {
        // ✅ Fetch user & vendor
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const vendor = await this.prisma.vendor.findUnique({ where: { id: dto.vendorId } });

        if (!user || !vendor) {
            throw new Error('Invalid user or vendor');
        }

        // ✅ Create order inside transaction
        const order = await this.prisma.$transaction(async (tx) => {
            return tx.order.create({
                data: {
                    userId,
                    vendorId: dto.vendorId,
                    subtotal: dto.subtotal,
                    tax: dto.tax,
                    deliveryFee: dto.deliveryFee,
                    total: dto.total,
                    items: {
                        create: dto.items.map((item) => ({
                            menuId: item.menuId,
                            name: item.name,
                            image: item.image,
                            basePrice: Number(item.price), // keep price consistent
                            quantity: item.quantity,
                            totalCost: item.totalCost,
                            variant: item.variant
                                ? {
                                    create: {
                                        variantId: item.variant.id,
                                        name: item.variant.name,
                                        price: item.variant.price,
                                        count: item.variant.count,
                                        total: item.variant.total,
                                        isDefault: item.variant.isDefault || false,
                                    },
                                }
                                : undefined,
                            extras: item.extras && item.extras.length > 0
                                ? {
                                    create: item.extras.map((extra) => ({
                                        extraId: extra.id,
                                        name: extra.name,
                                        price: extra.price,
                                        count: extra.count,
                                        total: extra.total,
                                    })),
                                }
                                : undefined,
                        })),
                    },
                },
                include: {
                    user: true,
                    items: { include: { variant: true, extras: true } },
                },
            });
        });

        console.log("sendng emal", vendor, user)
        // 📧 Send receipt to customer
        await this.emailQueue.enqueueSendOrderEmail({
            to: order.user.email,
            customerName: user.name.split(' ')[0] || 'Customer',
            orderId: order.id,
            items: order.items.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                total: i.totalCost,
            })),
            subtotal: order.subtotal,
            tax: order.tax,
            deliveryFee: order.deliveryFee,
            totalAmount: order.total,
        });

        // 📧 Send notification to vendor
        await this.emailQueue.enqueueVendorOrderEmail({
            to: vendor.email ?? 'vendor@example.com',
            vendorName: vendor.businessName ?? 'Vendor',
            orderId: order.id,
            customerName: user.name.split(' ')[0] || 'Customer',
            items: order.items.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                total: i.totalCost,
            })),
            totalAmount: order.total,
            actionUrl: `${process.env.APP_URL}/vendor/orders/${order.id}`,
        });

        // 🔔 Emit saved order (or mapped DTO)
        this.orderGateway.emitNewOrder(order);

        return order;
    }



    async getUserOrders(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { items: { include: { variant: true, extras: true } } },
        });
    }

    async updateOrderStatus(orderId: string, status: OrderStatus) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: { status },
        });
    }
}
