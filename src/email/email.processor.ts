import { Worker } from 'bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailQueues } from './email.queue.js';
import { EmailService } from './email.service.js';

@Injectable()
export class EmailProcessor implements OnModuleInit {
    private worker: Worker;

    constructor(
        private emailService: EmailService,
        private config: ConfigService,
    ) { }

    onModuleInit() {
        this.worker = new Worker(
            'emailQueue',
            async job => {
                switch (job.name) {
                    case EmailQueues.SEND_OTP: {
                        const { to, otp, name } = job.data;
                        await this.emailService.sendOtpEmail(to, otp, name);
                        break;
                    }

                    case EmailQueues.VERIFY_ACCOUNT: {
                        const { to, name } = job.data;
                        await this.emailService.sendAccountVerifiedEmail(to, name);
                        break;
                    }

                    case EmailQueues.RESET_PASSWORD: {
                        const { to, otp, name } = job.data;
                        await this.emailService.sendResetPasswordOtp(to, otp, name);
                        break;
                    }

                    case EmailQueues.RESET_PASSWORD_SUCCESSFUL: {
                        const { to, name } = job.data;
                        await this.emailService.sendResetPasswordSuccessful(to, name);
                        break;
                    }

                    case EmailQueues.SEND_ORDER: {
                        const payload = job.data;
                        await this.emailService.sendOrderReceipt(payload);
                        break;
                    }

                    case EmailQueues.SEND_VENDOR_ORDER: {
                        const payload = job.data;
                        await this.emailService.sendVendorOrderNotification(payload);
                        break;
                    }

                    case EmailQueues.SEND_ORDER_UPDATE: {
                        const payload = job.data;
                        await this.emailService.sendOrderUpdateEmail(payload);
                        break;
                    }

                    default:
                        console.warn(`[EmailQueue] Unknown job type: ${job.name}`);
                }
            },
            {
                connection: {
                    url: this.config.get<string>('REDIS_URL'),
                },
            },
        );

        // ✅ Logging
        this.worker.on('completed', job => {
            console.log(`[EmailQueue] Job completed: ${job.id} (${job.name})`);
        });

        this.worker.on('failed', (job, err) => {
            console.error(`[EmailQueue] Job failed: ${job?.id} (${job?.name})`, err);
        });

        this.worker.on('error', err => {
            console.error('[EmailQueue] Worker error:', err);
        });
    }
}
