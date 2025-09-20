import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [NotificationsGateway, NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule { }
