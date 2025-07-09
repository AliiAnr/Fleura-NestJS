import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  ConnectedSocket,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";

@Injectable()
@WebSocketGateway({ cors: true })
export class OrderGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // Opsi: Anda bisa menambahkan logika otentikasi awal di sini
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket, // Mengambil instance socket klien
    orderId: string // Mengambil data pertama dari emit('joinRoom', orderId)
  ): void {
    if (orderId && typeof orderId === 'string') {
      client.join(orderId); // Klien bergabung ke room yang dinamai dengan orderId
      console.log(`Client ${client.id} joined room for Order ID: ${orderId}`);
    } else {
      console.warn(`Client ${client.id} tried to join with invalid or empty orderId: ${orderId}`);
    }
  }

  sendOrderStatusUpdate(orderId: string, data: any) {
    if (orderId && typeof orderId === 'string') {
      console.log(`Emitting 'order:statusChanged' to room ${orderId} with data:`, data);
      this.server.to(orderId).emit("order:statusChanged", data);
    } else {
      console.warn(`Attempted to send order status update without a valid orderId. Data:`, data);
    }
  }

  sendPaymentStatusUpdate(orderId: string, data: any) {
    if (orderId && typeof orderId === 'string') {
      console.log(`Emitting 'payment:statusChanged' to room ${orderId} with data:`, data);
      this.server.to(orderId).emit("payment:statusChanged", data);
    } else {
      console.warn(`Attempted to send payment status update without a valid orderId. Data:`, data);
    }
  }
}
