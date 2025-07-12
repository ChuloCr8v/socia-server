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

        console.log("s:", apiKey, from, emailUrl)
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

    async sendOtpEmail(to: string, otp: string, name: string) {
        const filePath = join(__dirname, 'templates', 'otp.ejs');
        const template = await readFile(filePath, 'utf8');


        const html = ejs.render(template, { otp, name, year: new Date().getFullYear() });


        this.sendEmail(to, 'Your OTP Code', html);


        return
    }

    async sendAccountVerifiedEmail(to: string, name: string) {
        const filePath = join(__dirname, 'templates', 'verification-successful.ejs');
        const template = await readFile(filePath, 'utf8');


        const html = ejs.render(template, { name, year: new Date().getFullYear() });

        await this.sendEmail(to, 'Account Verified Successfully', html);

        return
    }

    async sendResetPasswordOtp(to: string, otp: string, name: string) {

        const filePath = join(__dirname, 'templates', 'reset-password.ejs');

        const template = await readFile(filePath, 'utf8');

        const html = ejs.render(template, { otp, name, year: new Date().getFullYear() });

        await this.sendEmail(to, 'Reset Account Password', html);
        return
    }

    async sendResetPasswordSuccessful(to: string, name: string) {
        const filePath = join(__dirname, 'templates', 'reset-password-successful.ejs');
        const template = await readFile(filePath, 'utf8');


        const html = ejs.render(template, { name, year: new Date().getFullYear() });

        return this.sendEmail(to, 'Reset Account Password', html);
    }
}
