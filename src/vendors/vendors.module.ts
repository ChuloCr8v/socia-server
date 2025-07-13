import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { EmailModule } from 'src/email/email.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OtpModule } from 'src/otp/otp.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [EmailModule, PrismaModule, OtpModule, AuthModule],
  controllers: [VendorsController],
  providers: [VendorsService]
})
export class VendorsModule { }
