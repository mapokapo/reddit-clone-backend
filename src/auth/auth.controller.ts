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
import { CreateUserDto } from "src/users/dtos/create-user.dto";
import { Request, Response } from "express";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Session } from "src/sessions/entities/session.entity";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService
  ) {}

  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: Session,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiOperation({
    summary: "Login",
    operationId: "login",
  })
  @Post("login")
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginRequest: LoginRequest
  ): Promise<Session> {
    const user = await this.usersService.findOneByEmail(loginRequest.email);

    if (user === null) {
      throw new UnauthorizedException();
    }

    const passwordMatches = await this.usersService.comparePasswords(
      loginRequest.password,
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

  @ApiResponse({
    status: 200,
    description: "Logout successful",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiOperation({
    summary: "Logout",
    operationId: "logout",
  })
  @Post("logout")
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ): Promise<null> {
    const token = req.cookies["SESSION_TOKEN"] as string | undefined;

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

  @ApiResponse({
    status: 200,
    description: "Register successful",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiOperation({
    summary: "Register",
    operationId: "register",
  })
  @Post("register")
  async register(@Body() registerRequest: RegisterRequest): Promise<null> {
    const createUserDto = new CreateUserDto();
    createUserDto.email = registerRequest.email;
    createUserDto.username = registerRequest.username;
    createUserDto.password = registerRequest.password;

    await this.usersService.create(createUserDto);

    return null;
  }
}
