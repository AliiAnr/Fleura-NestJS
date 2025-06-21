import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";

@Injectable()
@WebSocketGateway({ cors: true })
export class OrderGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Client mengirim join room setelah login
    client.on("joinRoom", (userId: string) => {
      client.join(userId); // Buyer/seller/admin pakai userId sebagai room
      console.log(`User ${userId} joined their room`);
    });
  }

  sendOrderStatusUpdate(userId: string, data: any) {
    this.server.to(userId).emit("order:statusChanged", data);
  }

  sendPaymentStatusUpdate(userId: string, data: any) {
    this.server.to(userId).emit("payment:statusChanged", data);
  }
}
