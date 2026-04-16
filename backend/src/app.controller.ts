import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';
import { BUNDLES_UPDATE_STRATEGY } from './presets/bundles.service';

@Controller()export class
AppController {
  @Public()
  @Get('health')
  getHealth(): string {
    return 'OK';
  }

  @Public()
  @Get('health/details')
  getHealthDetails() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      pid: process.pid,
      instanceId: process.env.INSTANCE_ID || `${process.pid}`,
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      bundlesUpdateStrategy: BUNDLES_UPDATE_STRATEGY,
    };
  }
}
