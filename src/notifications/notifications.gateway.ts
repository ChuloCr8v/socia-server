// src/notifications/notifications.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private activeUsers: Map<string, string> = new Map(); // userId -> socketId

    constructor(private readonly notificationsService: NotificationsService) { }

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            this.activeUsers.set(userId, client.id);
            console.log(`User ${userId} connected`);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = [...this.activeUsers.entries()]
            .find(([_, socketId]) => socketId === client.id)?.[0];
        if (userId) {
            this.activeUsers.delete(userId);
            console.log(`User ${userId} disconnected`);
        }
    }

    async sendNotification(payload: {
        type: string;
        title: string;
        message: string;
        senderId?: string;
        receiverId: string;
    }) {
        // Save in DB
        const notification = await this.notificationsService.createNotification(payload);

        // Emit only to the receiver if online
        const socketId = this.activeUsers.get(payload.receiverId);
        if (socketId) {
            this.server.to(socketId).emit('receiveNotification', notification);
        }

        return notification;
    }
}
