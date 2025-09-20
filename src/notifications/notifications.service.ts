import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async createNotification(data: {
        type: string;
        title: string;
        message: string;
        senderId?: string;
        receiverId: string;
    }) {
        return this.prisma.notification.create({ data });
    }

    async getNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: { receiverId: userId },
            orderBy: { timestamp: 'desc' },
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }
}
