import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { EmailModule } from 'src/email/email.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [EmailModule, PrismaModule, OtpModule],
  controllers: [VendorsController],
  providers: [VendorsService]
})
export class VendorsModule { }
