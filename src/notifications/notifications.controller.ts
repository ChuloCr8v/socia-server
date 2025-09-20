// src/notifications/notifications.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    @Get(':userId')
    async getUserNotifications(@Param('userId') userId: string) {
        return this.notificationsService.getNotifications(userId);
    }

    @Post()
    async sendNotification(@Body() body: any) {
        return this.notificationsGateway.sendNotification(body);
    }

    @Post('read/:id')
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }
}
