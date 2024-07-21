import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CreateUserRequest } from "./transport/create-user.request";
import { CreateUserDto } from "./dtos/create-user.dto";
import { DecodedIdToken } from "firebase-admin/auth";
import { UseAuth } from "src/auth/use-auth.decorator";
import { ReqIdToken } from "src/auth/req-id-token.decorator";
import { User } from "./entities/user.entity";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({ description: "Created", type: User })
  @ApiOperation({
    summary: "Create a new user using a Firebase ID token",
    operationId: "createUser",
  })
  @UseAuth("no-profile")
  @Post()
  async create(
    @ReqIdToken() reqIdToken: DecodedIdToken,
    @Body() createUserRequest: CreateUserRequest
  ): Promise<User> {
    const email = reqIdToken.email;

    if (email === undefined) {
      throw new UnauthorizedException("No e-mail address found in ID token");
    }

    const createUserDto: CreateUserDto = {
      firebaseUid: reqIdToken.uid,
      email: email,
      name: createUserRequest.name,
    };

    return await this.usersService.create(createUserDto);
  }

  @ApiOkResponse({ description: "OK", type: User })
  @ApiNoContentResponse({ description: "No content" })
  @ApiOperation({
    summary: "Get the current user",
    operationId: "getMe",
  })
  @UseAuth("no-profile")
  @Get("me")
  async getMe(@ReqIdToken() reqIdToken: DecodedIdToken): Promise<User | null> {
    return await this.usersService.findOneByFirebaseUid(reqIdToken.uid);
  }
}
