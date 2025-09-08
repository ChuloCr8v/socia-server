import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CreateOrderDto } from './types';

@WebSocketGateway({ cors: true })
export class OrderGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;

    afterInit() {
        console.log('Order Gateway Initialized');
    }

    emitNewOrder(order: any) {
        this.server.emit('newOrder', order);
    }
}
