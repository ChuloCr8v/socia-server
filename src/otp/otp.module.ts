import { Module } from '@nestjs/common';
import { OtpService } from './otp.service.js';
import { OtpController } from './otp.controller';
import { EmailQueue } from '../email/email.queue.js';

@Module({
  providers: [OtpService, EmailQueue],
  exports: [OtpService],
  controllers: [OtpController]
})
export class OtpModule { }
