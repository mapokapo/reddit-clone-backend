import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { SessionsService } from "src/sessions/sessions.service";
import { UsersService } from "src/users/users.service";
import { RegisterRequest } from "./transport/register.request";
import { CreateUserDto } from "src/users/dtos/create-user.dto";
import { Request, Response } from "express";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthenticatedRequest } from "./authenticated-request";
import { LocalAuthGuard } from "./guards/local.guard";
import { LoginRequest } from "./transport/login.request";
import { GoogleAuthGuard } from "./guards/google.guard";

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
    headers: {
      "Set-Cookie": {
        description: "Session token",
        schema: {
          type: "string",
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiOperation({
    summary: "Login",
    operationId: "login",
  })
  @ApiBody({
    type: LoginRequest,
  })
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.sessionsService.createAndSetSessionCookie(res, req.user);
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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
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
    createUserDto.name = registerRequest.name;
    createUserDto.password = registerRequest.password;

    await this.usersService.create(createUserDto);

    return null;
  }

  @ApiResponse({
    status: 302,
    description: "Redirect to Google sign-in",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiOperation({
    summary: "Initiate sign in with Google",
    operationId: "signInWithGoogle",
  })
  @UseGuards(GoogleAuthGuard)
  @Get("google")
  async signInWithGoogle(): Promise<void> {
    // This method is intentionally empty - all of the logic is handled by the GoogleAuthGuard
  }

  @ApiResponse({
    status: 200,
    description: "Sign in with Google successful",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiOperation({
    summary: "Sign in with Google callback",
    operationId: "signInWithGoogleCallback",
  })
  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async signInWithGoogleCallback(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.sessionsService.createAndSetSessionCookie(res, req.user);

    res.redirect("http://localhost:3000/");
  }
}
