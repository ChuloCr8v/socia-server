import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailQueue } from '../email/email.queue.js';
import { OrderGateway } from './order.gateway';
import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './types';
import { PaymentsService } from 'src/payments/payments.service';
import { bad } from 'src/utils/error.utils';

@Injectable()
export class OrderService {
    constructor(
        private prisma: PrismaService,
        private emailQueue: EmailQueue,
        private orderGateway: OrderGateway,
        private paymentsService: PaymentsService
    ) { }

    async createOrder(dto: CreateOrderDto, userId: string) {
        try {
            // ✅ Fetch user & vendor
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            const vendor = await this.prisma.vendor.findUnique({ where: { id: dto.vendorId } });

            if (!user || !vendor) {
                return bad('Invalid user or vendor');
            }

            const verifyPayment = await this.paymentsService.verifyTransaction(
                dto.paymentReference
            );

            if (!verifyPayment) {
                return bad('Payment verification failed, unable to create order.');
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
                        deliveryAddress: dto.deliveryAddress,
                        paymentReference: dto.paymentReference,
                        noteForRider: dto.noteForRider,
                        items: {
                            create: dto.items.map((item) => ({
                                menuId: item.menuId,
                                name: item.name,
                                image: item.image,
                                basePrice: Number(item.basePrice),
                                quantity: item.quantity,
                                totalCost: Number(item.totalCost),
                                note: item.notes,
                                variant: item.variant
                                    ? {
                                        create: {
                                            variantId: item.variant.id,
                                            name: item.variant.name,
                                            price: Number(item.variant.price),
                                            count: item.variant.count,
                                            total: Number(item.variant.total),
                                            isDefault: item.variant.isDefault || false,
                                        },
                                    }
                                    : undefined,
                                extras:
                                    item.extras && item.extras.length > 0
                                        ? {
                                            create: item.extras.map((extra) => ({
                                                extraId: extra.id,
                                                name: extra.name,
                                                price: extra.price,
                                                count: extra.count,
                                                total: Number(extra.total),
                                            })),
                                        }
                                        : undefined,
                            })),
                        },
                        status: 'PLACED',
                    },
                    include: {
                        user: true,
                        items: { include: { variant: true, extras: true } },
                    },
                });
            });

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

            // 🔔 Emit saved order
            this.orderGateway.emitNewOrder(order);

            return order;
        } catch (error) {
            return bad(error);
        }
    }

    async getUserOrders(userId: string) {
        try {
            return await this.prisma.order.findMany({
                where: { userId },
                include: {
                    items: { include: { variant: true, extras: true } },
                    user: true,
                    vendor: { include: { profileImage: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            return bad(error);
        }
    }

    async getVendorOrders(vendorId: string) {
        try {
            return await this.prisma.order.findMany({
                where: { vendor: { id: vendorId } },
                include: {
                    items: { include: { variant: true, extras: true } },
                    user: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            return bad(error);
        }
    }

    async getOrder(orderId: string) {
        try {
            return await this.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: { include: { variant: true, extras: true } },
                    user: true,
                    vendor: { include: { profileImage: true } },
                },
            });
        } catch (error) {
            return bad(error);
        }
    }

    async updateOrderStatus(orderId: string, status: OrderStatus) {
        try {
            return await this.prisma.order.update({
                where: { id: orderId },
                data: { status },
            });
        } catch (error) {
            return bad(error);
        }
    }
}
