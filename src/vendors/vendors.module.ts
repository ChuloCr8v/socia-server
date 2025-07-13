import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { EmailModule } from '../email/email.module.js';
import { OtpModule } from '../otp/otp.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { VendorsController } from './vendors.controller.js';
import { VendorsService } from './vendors.service.js';

@Module({
  imports: [EmailModule, PrismaModule, OtpModule, AuthModule],
  controllers: [VendorsController],
  providers: [VendorsService]
})
export class VendorsModule { }
