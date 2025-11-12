/**
 * Application Controller
 * Root controller with health check endpoint
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public() // This endpoint is public (no authentication required)
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public() // Health check endpoint is public
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
