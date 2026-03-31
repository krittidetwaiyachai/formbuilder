import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket } from
'@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ActiveUser, FieldSelectionPayload, JoinFormPayload } from './types';
import { getUserColor } from './user-colors.util';
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
  namespace: '/collaboration'
})export class
CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(CollaborationGateway.name);
  private activeUsers: Map<string, Map<string, ActiveUser>> = new Map();
  private authenticatedClients = new Map<string, WsAuthenticatedUser>();
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
      this.logger.warn(`Unauthenticated collaboration connection rejected: ${client.id}`);
      client.disconnect(true);
      return;
    }
    this.authenticatedClients.set(client.id, user);
    this.logger.log(`Authenticated client connected: ${client.id} (${user.email})`);
  }
  handleDisconnect(client: Socket) {
    this.authenticatedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [formId, users] of this.activeUsers.entries()) {
      if (users.has(client.id)) {
        users.delete(client.id);
        this.broadcastActiveUsers(formId);
        if (users.size === 0) {
          this.activeUsers.delete(formId);
        }
      }
    }
  }
  @SubscribeMessage('join-form')
  async handleJoinForm(
    @MessageBody()data: JoinFormPayload,
    @ConnectedSocket()client: Socket)
  {
    const authenticatedUser = this.authenticatedClients.get(client.id);
    if (!authenticatedUser) {
      client.emit('join_error', { message: 'Authentication required' });
      return;
    }
    const { formId, userName } = data;
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
    if (!this.activeUsers.has(formId)) {
      this.activeUsers.set(formId, new Map());
    }
    const formUsers = this.activeUsers.get(formId);
    const color = getUserColor(authenticatedUser.userId);
    const user: ActiveUser = {
      id: authenticatedUser.userId,
      name: userName || authenticatedUser.email,
      email: authenticatedUser.email,
      color,
      selectedFieldId: null,
      socketId: client.id
    };
    formUsers!.set(client.id, user);
    client.join(`form-${formId}`);
    this.broadcastActiveUsers(formId);
    this.logger.log(`User ${authenticatedUser.email} joined form ${formId} (Socket: ${client.id})`);
  }
  @SubscribeMessage('leave-form')
  handleLeaveForm(
    @MessageBody()data: {formId: string;},
    @ConnectedSocket()client: Socket)
  {
    const { formId } = data;
    const formUsers = this.activeUsers.get(formId);
    if (formUsers) {
      formUsers.delete(client.id);
      this.broadcastActiveUsers(formId);
      if (formUsers.size === 0) {
        this.activeUsers.delete(formId);
      }
    }
    client.leave(`form-${formId}`);
    this.logger.log(`Client ${client.id} left form ${formId}`);
  }
  @SubscribeMessage('field-selected')
  handleFieldSelected(
    @MessageBody()data: FieldSelectionPayload,
    @ConnectedSocket()client: Socket)
  {
    const { formId, fieldId } = data;
    const formUsers = this.activeUsers.get(formId);
    if (formUsers) {
      const user = formUsers.get(client.id);
      if (user) {
        user.selectedFieldId = fieldId;
        this.broadcastActiveUsers(formId);
      }
    }
  }
  @SubscribeMessage('field-deselected')
  handleFieldDeselected(
    @MessageBody()data: {formId: string;},
    @ConnectedSocket()client: Socket)
  {
    const { formId } = data;
    const formUsers = this.activeUsers.get(formId);
    if (formUsers) {
      const user = formUsers.get(client.id);
      if (user) {
        user.selectedFieldId = null;
        this.broadcastActiveUsers(formId);
      }
    }
  }
  private broadcastActiveUsers(formId: string) {
    const formUsers = this.activeUsers.get(formId);
    if (!formUsers) return;
    const usersArray = Array.from(formUsers.values()).map((user) => ({
      id: user.id,
      name: user.name,
      color: user.color,
      selectedFieldId: user.selectedFieldId,
      socketId: user.socketId
    }));
    this.server.to(`form-${formId}`).emit('active-users', usersArray);
  }
}