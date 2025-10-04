import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [PrismaModule], // PrismaService is exported from here
  controllers: [NotificationsController],
  providers: [
    NotificationsService, // <-- Service must be listed BEFORE gateway
    NotificationsGateway, // <-- Gateway
  ],
  exports: [NotificationsService, NotificationsGateway], // optional if you want to use it elsewhere
})
export class NotificationsModule { }
