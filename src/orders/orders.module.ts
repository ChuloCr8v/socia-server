import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailQueue } from 'src/email/email.queue';
import { OrderController } from './orders.controller';
import { OrderService } from './orders.service';
import { PaymentsModule } from 'src/payments/payments.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [PaymentsModule, NotificationsModule],
  providers: [OrderService, PrismaService, EmailQueue],
  controllers: [OrderController],
})
export class OrdersModule { }
