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
                const { name, to, otp } = job.data;

                switch (job.name) {
                    case EmailQueues.SEND_OTP:
                        await this.emailService.sendOtpEmail(to, otp, name);
                        break;

                    case EmailQueues.VERIFY_ACCOUNT:
                        await this.emailService.sendAccountVerifiedEmail(to, name);
                        break;

                    case EmailQueues.RESET_PASSWORD:
                        await this.emailService.sendResetPasswordOtp(to, otp, name);
                        break;

                    case EmailQueues.RESET_PASSWORD_SUCCESSFUL:
                        await this.emailService.sendResetPasswordSuccessful(to, name);
                        break;

                    default:
                        console.warn(`Unknown job type: ${job.name}`);
                }
            },
            {
                connection: {
                    url: this.config.get<string>('REDIS_URL'),
                },
            },
        );

        // ✅ Add logging and error tracking
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
