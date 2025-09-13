// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as ejs from 'ejs';
import { join } from 'path';
import { readFile } from 'fs/promises';

@Injectable()
export class EmailService {
    constructor(private config: ConfigService) { }

    async sendEmail(to: string, subject: string, html: string) {
        const apiKey = this.config.get<string>('RESEND_API_KEY');
        const from = this.config.get<string>('RESEND_FROM_EMAIL');
        const emailUrl = this.config.get<string>('RESEND_EMAIL_BASE_URL');

        const response = await axios.post(
            emailUrl,
            { from, to, subject, html },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data;
    }

    private async renderTemplate(templateName: string, data: Record<string, any>) {
        const filePath = join(__dirname, 'templates', `${templateName}.ejs`);
        const template = await readFile(filePath, 'utf8');
        return ejs.render(template, { ...data, year: new Date().getFullYear() });
    }

    async sendOtpEmail(to: string, otp: string, name: string) {
        const html = await this.renderTemplate('otp', { otp, name });
        return this.sendEmail(to, 'Your OTP Code', html);
    }

    async sendAccountVerifiedEmail(to: string, name: string) {
        const html = await this.renderTemplate('verification-successful', { name });
        return this.sendEmail(to, 'Account Verified Successfully', html);
    }

    async sendResetPasswordOtp(to: string, otp: string, name: string) {
        const html = await this.renderTemplate('reset-password', { otp, name });
        return this.sendEmail(to, 'Reset Account Password', html);
    }

    async sendResetPasswordSuccessful(to: string, name: string) {
        const html = await this.renderTemplate('reset-password-successful', { name });
        return this.sendEmail(to, 'Reset Account Password', html);
    }

    async sendOrderReceipt(payload: {
        to: string;
        customerName: string;
        orderId: string;
        orderItems: {
            name: string;
            quantity: number;
            totalCost: number;
            customizations: {
                variants: { name: string };
                extras: { name: string; count: number; total: number }[];
            };
        }[];
        orderTotal: number;
    }) {
        const html = await this.renderTemplate('order-sent', payload);
        return this.sendEmail(
            payload.to,
            `Your Receipt for Order #${payload.orderId}`,
            html,
        );
    }

    async sendVendorOrderNotification(payload: {
        to: string;
        vendorName: string;
        orderId: string;
        customerName: string;
        orderItems: {
            name: string;
            quantity: number;
            totalCost: number;
            customizations: {
                variants: { name: string };
                extras: { name: string; count: number; total: number }[];
            };
        }[];
        totalAmount: number;
        actionUrl: string;
    }) {
        const html = await this.renderTemplate('order-received', payload);
        return this.sendEmail(
            payload.to,
            `New Order Received #${payload.orderId}`,
            html,
        );
    }
}
