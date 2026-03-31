import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect } from
'@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authenticateSocket, WsAuthenticatedUser } from '../common/guards/ws-auth.util';
import { PrismaService } from '../prisma/prisma.service';
import { FormAccessService } from '../common/guards/form-access.service';
@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, true);
    },
    credentials: true
  },
  namespace: 'forms'
})export class
FormGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('FormGateway');
  private authenticatedUsers = new Map<string, WsAuthenticatedUser>();
  constructor(
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
  private readonly prismaService: PrismaService,
  private readonly formAccessService: FormAccessService)
  {}
  async handleConnection(client: Socket) {
    const user = await authenticateSocket(
      client,
      this.jwtService,
      this.configService,
      this.prismaService
    );
    if (!user) {
      this.logger.warn(`Unauthenticated connection rejected: ${client.id}`);
      client.disconnect(true);
      return;
    }
    this.authenticatedUsers.set(client.id, user);
    this.logger.log(`Authenticated client connected: ${client.id} (${user.email})`);
  }
  handleDisconnect(client: Socket) {
    this.authenticatedUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  @SubscribeMessage('join_form')
  async handleJoinForm(
    @MessageBody()formId: string,
    @ConnectedSocket()client: Socket) {
    const authenticatedUser = this.authenticatedUsers.get(client.id);
    if (!authenticatedUser) {
      client.emit('join_error', { message: 'Authentication required' });
      return;
    }
    try {
      await this.formAccessService.assertReadAccess(
        formId,
        authenticatedUser.userId,
        authenticatedUser.role
      );
    } catch (error) {
      const message = error instanceof ForbiddenException ? error.message : 'Unable to join form';
      client.emit('join_error', { message });
      return;
    }
    const room = `form_${formId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: 'joined_room', data: room };
  }
  @SubscribeMessage('leave_form')
  handleLeaveForm(
    @MessageBody()formId: string,
    @ConnectedSocket()client: Socket) {
    const room = `form_${formId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
  }
  @SubscribeMessage('update_form_client')
  async handleFormUpdate(
    @MessageBody()payload: {formId: string;data: Record<string, unknown>;},
    @ConnectedSocket()client: Socket) {
    const authenticatedUser = this.authenticatedUsers.get(client.id);
    if (!authenticatedUser) {
      client.emit('update_error', { message: 'Authentication required' });
      return;
    }
    try {
      await this.formAccessService.assertReadAccess(
        payload.formId,
        authenticatedUser.userId,
        authenticatedUser.role
      );
    } catch {
      client.emit('update_error', { message: 'You do not have access to this form' });
      return;
    }
    const room = `form_${payload.formId}`;
    client.to(room).emit('form_updated', payload.data);
    this.logger.log(`Broadcasted update to room: ${room}`);
  }
}