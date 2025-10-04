import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@prisma/client';

export enum EmailQueues {
    SEND_OTP = 'SEND_OTP',
    VERIFY_ACCOUNT = 'VERIFY_ACCOUNT',
    RESET_PASSWORD = 'RESET_PASSWORD',
    RESET_PASSWORD_SUCCESSFUL = 'RESET_PASSWORD_SUCCESSFUL',
    SEND_ORDER = 'SEND_ORDER',           // customer receipt
    SEND_VENDOR_ORDER = 'SEND_VENDOR_ORDER', // vendor notification
    SEND_ORDER_UPDATE = 'SEND_ORDER_UPDATE', // vendor notification
}

@Injectable()
export class EmailQueue {
    private queue: Queue;

    constructor(private config: ConfigService) {
        this.queue = new Queue('emailQueue', {
            connection: { url: config.get<string>('REDIS_URL') },
        });
    }

    async enqueueOtpEmail(to: string, otp: string, name: string) {
        await this.queue.add(EmailQueues.SEND_OTP, { to, otp, name });
    }

    async enqueueVerifyAccount(to: string, name: string) {
        await this.queue.add(EmailQueues.VERIFY_ACCOUNT, { to, name });
    }

    async enqueueResetPasswordOtp(to: string, otp: string, name: string) {
        await this.queue.add(EmailQueues.RESET_PASSWORD, { to, otp, name });
    }

    async enqueueResetPasswordSuccessful(to: string, name: string) {
        await this.queue.add(EmailQueues.RESET_PASSWORD_SUCCESSFUL, { to, name });
    }

    // ✅ Customer order receipt
    async enqueueSendOrderEmail(payload: {
        to: string;
        customerName: string;
        orderId: string;
        items: { name: string; quantity: number; total: number }[];
        subtotal: number;
        tax: number;
        deliveryFee: number;
        totalAmount: number;
    }) {
        await this.queue.add(EmailQueues.SEND_ORDER, payload);
    }

    // ✅ Vendor new order notification
    async enqueueVendorOrderEmail(payload: {
        to: string;
        vendorName: string;
        orderId: string;
        customerName: string;
        items: { name: string; quantity: number; total: number }[];
        totalAmount: number;
        actionUrl: string;
    }) {
        await this.queue.add(EmailQueues.SEND_VENDOR_ORDER, payload);
    }


    // ✅ Customer order status update
    async enqueueUpdateStatusEmail(payload: {
        to: string;
        customerName: string;
        orderId: string;
        orderStatus: OrderStatus;
        items: Array<{ name: string; quantity: number; total: number }>;
        status: OrderStatus
        totalAmount: number;
        rejectionReason?: string | null;
        rejectionNote?: string | null;
        eta?: string | null;
        actionUrl?: string;
    }) {
        await this.queue.add(EmailQueues.SEND_ORDER_UPDATE, payload, {
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true,
        });
    }
}
