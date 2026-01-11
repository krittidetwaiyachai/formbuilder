import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for dev
  },
  namespace: 'forms', // Separate namespace for form events
})
export class FormGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('FormGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_form')
  handleJoinForm(
    @MessageBody() formId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `form_${formId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: 'joined_room', data: room };
  }

  @SubscribeMessage('leave_form')
  handleLeaveForm(
    @MessageBody() formId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `form_${formId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
  }

  @SubscribeMessage('update_form_client')
  handleFormUpdate(
    @MessageBody() payload: { formId: string; data: any },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `form_${payload.formId}`;
    // Broadcast to everyone else in the room
    client.to(room).emit('form_updated', payload.data);
    this.logger.log(`Broadcasted update to room: ${room}`);
  }
}
