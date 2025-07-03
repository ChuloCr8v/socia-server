import { Worker } from 'bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailProcessor implements OnModuleInit {
    constructor(
        private emailService: EmailService,
        private config: ConfigService,
    ) { }

    onModuleInit() {
        new Worker(
            'emailQueue',
            async job => {
                const { name, to, otp } = job.data;

                switch (job.name) {
                    case 'send-otp':
                        await this.emailService.sendOtpEmail(to, otp, name);
                        break;

                    case 'verify-account':
                        await this.emailService.sendAccountVerifiedEmail(to, name);
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
    }
}
