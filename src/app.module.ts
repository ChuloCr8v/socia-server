import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { VendorsModule } from './vendors/vendors.module';
import { EmailModule } from './email/email.module';
import { OtpModule } from './otp/otp.module';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, PrismaModule, VendorsModule, EmailModule, OtpModule, AdminModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (config: ConfigService) => ({
      secret: config.get<string>('JWT_SECRET', 'supersecretkey'),
      signOptions: { expiresIn: '1d' },
    }),
    inject: [ConfigService],
  })],
  controllers: [AppController],
  providers: [AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // }
  ],
})
export class AppModule { }
