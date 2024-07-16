import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { SessionsService } from "src/sessions/sessions.service";
import { UsersService } from "src/users/users.service";
import { LoginRequest } from "./transport/login.request";
import { RegisterRequest } from "./transport/register.request";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { CreateUserDto } from "src/users/dtos/create-user.dto";
import { Request, Response } from "express";
import { ApiResponse } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService
  ) {}

  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Post("login")
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginRequest
  ) {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordMatches = await this.usersService.comparePasswords(
      loginDto.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    const session = await this.sessionsService.create(user);

    res.cookie("SESSION_TOKEN", session.token, {
      httpOnly: true,
      expires: session.expiresAt,
    });

    return session;
  }

  @ApiResponse({ status: 200, description: "Logout successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const token = req.cookies["SESSION_TOKEN"];

    if (!token) {
      throw new UnauthorizedException();
    }

    const session = await this.sessionsService.findOneByToken(token);

    if (!session) {
      throw new UnauthorizedException();
    }

    await this.sessionsService.delete(session);

    res.clearCookie("SESSION_TOKEN");

    return null;
  }

  @ApiResponse({ status: 200, description: "Register successful" })
  @Post("register")
  async register(@Body() registerDto: RegisterRequest) {
    const registerDtoData = instanceToPlain(registerDto);
    const createUserDto = plainToInstance(CreateUserDto, registerDtoData);

    await this.usersService.create(createUserDto);

    return null;
  }
}
