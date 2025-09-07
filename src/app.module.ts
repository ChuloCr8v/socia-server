import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { EmailModule } from './email/email.module.js';
import { OtpModule } from './otp/otp.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { VendorsModule } from './vendors/vendors.module.js';
import { MenuModule } from './menu/menu.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ImagesModule } from './images/images.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes config available in all modules
    }),
    AuthModule, PrismaModule, VendorsModule, EmailModule, OtpModule, AdminModule, JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'supersecretkey'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }), MenuModule, CloudinaryModule, ImagesModule, UsersModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // }
  ],
})
export class AppModule { }
