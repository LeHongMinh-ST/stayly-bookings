/**
 * App Service
 * Root service for basic application info
 */

import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Stayly Bookings API";
  }
}
