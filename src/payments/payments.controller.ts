// payments.controller.ts
import { Controller, Post, Body, Get, Param, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';
import * as crypto from 'crypto';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('init')
    async initTransaction(@Body() body: { email: string; amount: number }) {
        return this.paymentsService.initializeTransaction(body.email, body.amount);
    }

    @Get('verify/:reference')
    async verifyTransaction(@Param('reference') reference: string) {
        return this.paymentsService.verifyTransaction(reference);
    }

    // ✅ Paystack webhook
    @Post('webhook')
    async handleWebhook(
        @Body() body: any,
        @Headers('x-paystack-signature') signature: string,
    ) {
        // Verify webhook signature
        const secret = process.env.PAYSTACK_SECRET_KEY;
        const hash = crypto
            .createHmac('sha512', secret)
            .update(JSON.stringify(body))
            .digest('hex');

        if (hash !== signature) {
            return { status: false, message: 'Invalid signature' };
        }

        // Handle events (success, failed, chargeback, etc.)
        if (body.event === 'charge.success') {
            const data = body.data;
            console.log('✅ Payment confirmed via webhook:', data);

            // TODO: Save to DB or update order status
        }

        return { status: true, message: 'Webhook received' };
    }
}
