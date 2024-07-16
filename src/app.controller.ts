import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "./auth/auth.guard";
import { ApiCookieAuth, ApiResponse } from "@nestjs/swagger";

@Controller("app")
export class AppController {
  @ApiResponse({ status: 200, description: "Hello World!" })
  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Get()
  async getHello(): Promise<string> {
    return "Hello World!";
  }
}
