import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
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

  @ApiCreatedResponse({ description: "User created", type: User })
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
}
