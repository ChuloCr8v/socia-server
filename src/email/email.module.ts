import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { EmailQueue } from './email.queue';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailQueue, EmailProcessor],
  exports: [EmailService, EmailQueue]
})
export class EmailModule { }
