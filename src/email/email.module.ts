import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailProcessor } from './email.processor.js';
import { EmailQueue } from './email.queue.js';
import { EmailService } from './email.service.js';


@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailQueue, EmailProcessor],
  exports: [EmailService, EmailQueue]
})
export class EmailModule { }
