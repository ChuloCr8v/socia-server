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
        const notification = await this.prisma.notification.create({ data });

        // 2️⃣ Send push notification to offline devices
        const user = await this.prisma.user.findUnique({
            where: { id: data.receiverId },
            select: { expoPushTokens: true }, // array of Expo push tokens for this user
        });

        if (user?.expoPushTokens?.length) {
            for (const token of user.expoPushTokens) {
                this.sendPushNotification(token, data.title, data.message);
            }
        }

        return notification;
    }

    async sendPushNotification(
        expoPushToken: string,
        title: string,
        body: string,
    ) {
        try {
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: expoPushToken, // token for the target device
                    sound: 'default',   // default sound
                    title,
                    body,
                    data: { title, body }, // optional extra data
                }),
            });
        } catch (err) {
            console.error('Error sending push notification:', err);
        }
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
