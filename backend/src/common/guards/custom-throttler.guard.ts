import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
interface RequestWithUser extends Request {
  user?: {id: string;};
}
@Injectable()export class
CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: RequestWithUser): Promise<string> {
    if (req.user && req.user.id) {
      return req.user.id;
    }
    return req.ips.length ? req.ips[0] : req.ip;
  }
}