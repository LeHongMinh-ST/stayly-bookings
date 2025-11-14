/**
 * App Controller
 * Root controller for health check and basic info
 */

import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AppService } from "./app.service";

@Controller()
@ApiTags("app")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: "Health check" })
  getHello(): string {
    return this.appService.getHello();
  }
}
