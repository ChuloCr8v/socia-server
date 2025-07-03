import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailQueue {
    private queue: Queue;

    constructor(private config: ConfigService) {
        this.queue = new Queue('emailQueue', {
            connection: { url: config.get<string>('REDIS_URL') },
        });
    }

    async enqueueOtpEmail(to: string, otp: string, name: string) {
        await this.queue.add('send-otp', { to, otp, name });
    }

    async enqueueVerifyAccount(to: string, name: string) {
        await this.queue.add('verify-account', { to, name });
    }
}
