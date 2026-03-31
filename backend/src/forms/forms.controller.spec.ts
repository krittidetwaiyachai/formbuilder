import { ForbiddenException } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { FormsController } from './forms.controller';
describe('FormsController security checks', () => {
  let controller: FormsController;
  let formAccessService: {assertReadAccess: jest.Mock;};
  let activityLogService: {getFormActivity: jest.Mock;getFormEditors: jest.Mock;};
  const user = {
    id: 'user-1',
    email: 'owner@example.com',
    role: RoleType.EDITOR
  };
  beforeEach(() => {
    formAccessService = {
      assertReadAccess: jest.fn().mockResolvedValue(undefined)
    };
    activityLogService = {
      getFormActivity: jest.fn().mockResolvedValue({ data: [] }),
      getFormEditors: jest.fn().mockResolvedValue([])
    };
    controller = new FormsController(
      {} as any,
      activityLogService as any,
      formAccessService as any
    );
  });
  it('checks form access before returning activity', async () => {
    await controller.getFormActivity('form-1', user);
    expect(formAccessService.assertReadAccess).toHaveBeenCalledWith(
      'form-1',
      user.id,
      user.role
    );
    expect(activityLogService.getFormActivity).toHaveBeenCalled();
  });
  it('checks form access before returning editors', async () => {
    await controller.getFormEditors('form-1', user);
    expect(formAccessService.assertReadAccess).toHaveBeenCalledWith(
      'form-1',
      user.id,
      user.role
    );
    expect(activityLogService.getFormEditors).toHaveBeenCalledWith('form-1');
  });
  it('does not leak activity when access is denied', async () => {
    formAccessService.assertReadAccess.mockRejectedValue(
      new ForbiddenException('You do not have access to this form')
    );
    await expect(controller.getFormActivity('form-1', user)).rejects.toBeInstanceOf(
      ForbiddenException
    );
    expect(activityLogService.getFormActivity).not.toHaveBeenCalled();
  });
});