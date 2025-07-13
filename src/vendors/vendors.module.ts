import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module.js';
import { EmailModule } from 'src/email/email.module.js';
import { OtpModule } from 'src/otp/otp.module.js';
import { PrismaModule } from 'src/prisma/prisma.module.js';
import { VendorsController } from './vendors.controller.js';
import { VendorsService } from './vendors.service.js';

@Module({
  imports: [EmailModule, PrismaModule, OtpModule, AuthModule],
  controllers: [VendorsController],
  providers: [VendorsService]
})
export class VendorsModule { }
