import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailQueue } from 'src/email/email.queue';
import { OrderController } from './orders.controller';
import { OrderService } from './orders.service';
import { OrderGateway } from './order.gateway';
import { PaymentsService } from 'src/payments/payments.service';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [PaymentsModule],
  providers: [OrderService, PrismaService, OrderGateway, EmailQueue],
  controllers: [OrderController],
})
export class OrdersModule { }
