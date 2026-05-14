import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect } from
'@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { authenticateSocket } from '../common/guards/ws-auth.util';
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})export class
EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(
  private jwtService: JwtService,
  private configService: ConfigService,
  private prismaService: PrismaService)
  {}
  async handleConnection(client: Socket) {
    try {
      const user = await authenticateSocket(
        client,
        this.jwtService,
        this.configService,
        this.prismaService
      );
      if (!user) {
        client.disconnect();
        return;
      }
      client.join(`user_${user.userId}`);
      console.log(`Client connected: ${client.id}, User: ${user.userId}`);
    } catch (error) {
      console.log('Socket connection unauthorized');
      client.disconnect();
    }
  }
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}