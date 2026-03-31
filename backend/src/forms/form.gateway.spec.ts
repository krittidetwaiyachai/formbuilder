import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RoleType } from '@prisma/client';
import { FormGateway } from './form.gateway';
describe('FormGateway authorization', () => {
  let gateway: FormGateway;
  let formAccessService: {assertReadAccess: jest.Mock;};
  beforeEach(() => {
    formAccessService = {
      assertReadAccess: jest.fn().mockResolvedValue(undefined)
    };
    gateway = new FormGateway(
      {} as JwtService,
      {} as ConfigService,
      {} as any,
      formAccessService as any
    );
  });
  it('joins the room when the authenticated user has access', async () => {
    const join = jest.fn();
    const emit = jest.fn();
    const client = { id: 'socket-1', join, emit } as any;
    gateway['authenticatedUsers'].set(client.id, {
      userId: 'user-1',
      email: 'owner@example.com',
      role: RoleType.EDITOR
    });
    await expect(gateway.handleJoinForm('form-1', client)).resolves.toEqual({
      event: 'joined_room',
      data: 'form_form-1'
    });
    expect(formAccessService.assertReadAccess).toHaveBeenCalledWith(
      'form-1',
      'user-1',
      RoleType.EDITOR
    );
    expect(join).toHaveBeenCalledWith('form_form-1');
    expect(emit).not.toHaveBeenCalledWith('join_error', expect.anything());
  });
  it('rejects the join when the authenticated user lacks access', async () => {
    const join = jest.fn();
    const emit = jest.fn();
    const client = { id: 'socket-1', join, emit } as any;
    gateway['authenticatedUsers'].set(client.id, {
      userId: 'user-2',
      email: 'outsider@example.com',
      role: RoleType.USER
    });
    formAccessService.assertReadAccess.mockRejectedValue(
      new ForbiddenException('You do not have access to this form')
    );
    await expect(gateway.handleJoinForm('form-1', client)).resolves.toBeUndefined();
    expect(join).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith('join_error', {
      message: 'You do not have access to this form'
    });
  });
});