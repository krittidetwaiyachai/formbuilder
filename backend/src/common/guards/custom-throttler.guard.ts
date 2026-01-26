import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    
    if (req.user && (req.user as any).id) {
      return (req.user as any).id;
    }
    
    
    return req.ips.length ? req.ips[0] : req.ip;
  }
}
