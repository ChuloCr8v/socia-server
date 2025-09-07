import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailQueue } from 'src/email/email.queue';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtpService } from 'src/otp/otp.service';

@Module({
  providers: [UsersService, PrismaService, EmailQueue, OtpService],
  controllers: [UsersController]
})
export class UsersModule { }
