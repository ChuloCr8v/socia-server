import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum EmailQueues {
    SEND_OTP = "SEND_OTP",
    VERIFY_ACCOUNT = "VERIFY_ACCOUNT",
    RESET_PASSWORD = 'RESET_PASSWORD',
    RESET_PASSWORD_SUCCESSFUL = 'RESET_PASSWORD_SUCCESSFUL',

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

    async enqueueResetPasswordOtp(to: string, otp: string,
        name: string) {


        await this.queue.add(EmailQueues.RESET_PASSWORD, { to, otp, name });

    }

    async enqueueResetPasswordSuccessful(to: string,
        name: string) {
        await this.queue.add(EmailQueues.RESET_PASSWORD_SUCCESSFUL, { to, name });
    }
}
