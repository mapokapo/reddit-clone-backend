import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import { CreateUserRequest } from "./transport/create-user.request";
import { CreateUserDto } from "./dtos/create-user.dto";
import { DecodedIdToken } from "firebase-admin/auth";
import { UseAuth } from "src/auth/use-auth.decorator";
import { ReqIdToken } from "src/auth/req-id-token.decorator";
import { User } from "./entities/user.entity";
import { Post as PostEntity } from "src/posts/entities/post.entity";
import { ReqUser } from "src/auth/req-user.decorator";
import { GetUserDataQuery } from "./transport/get-user-data.query";
import { Vote } from "src/votes/vote.entity";
import { PostResponse } from "src/posts/transport/post.response";
import { CommentResponse } from "src/comments/transport/comment.response";
import { ReplyResponse } from "src/replies/transport/reply.response";
import { Comment } from "src/comments/entities/comment.entity";
import { Reply } from "src/replies/entities/reply.entity";

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
      photoUrl: createUserRequest.photoUrl ?? null,
    };

    return await this.usersService.create(createUserDto);
  }

  @ApiExtraModels(Vote)
  @ApiOkResponse({
    description: "OK",
    schema: {
      type: "array",
      items: {
        anyOf: [
          { $ref: getSchemaPath(PostResponse) },
          { $ref: getSchemaPath(Vote) },
        ],
      },
    },
    isArray: true,
  })
  @ApiOperation({
    summary: "Get aggregated user data for a user",
    description:
      "This endpoint is used by the client to get user data such as posts, comments, and votes for a user.",
    operationId: "getUserData",
  })
  @UseAuth()
  @Get("userdata/:userId")
  async getUserData(
    @Param("userId", new ParseIntPipe()) userId: number,
    @ReqUser() reqUser: User,
    @Query() query: GetUserDataQuery
  ): Promise<(PostResponse | CommentResponse | ReplyResponse | Vote)[] | null> {
    const data = await this.usersService.getUserData(
      userId,
      query.include ?? []
    );

    if (data === null) {
      return null;
    }

    return data.map(item => {
      if (item instanceof PostEntity) {
        return PostResponse.entityToResponse(item, reqUser);
      } else if (item instanceof Reply) {
        return ReplyResponse.entityToResponse(item, reqUser);
      } else if (item instanceof Comment) {
        return CommentResponse.entityToResponse(item, reqUser);
      } else {
        return item;
      }
    });
  }

  @ApiOkResponse({ description: "OK", type: User })
  @ApiNoContentResponse({ description: "No content" })
  @ApiOperation({
    summary: "Get the current user",
    description:
      "This endpoint is used by the client to get the current user. Returns 204 if the authenticated user doesn't have a profile.",
    operationId: "getMe",
  })
  @UseAuth("no-profile")
  @Get("me")
  async getMe(@ReqIdToken() reqIdToken: DecodedIdToken): Promise<User | null> {
    return await this.usersService.findOneByFirebaseUid(reqIdToken.uid);
  }

  @ApiOkResponse({ description: "OK", type: User })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Get a user's profile by ID",
    operationId: "getUserById",
  })
  @Get(":id")
  async getUserById(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<User> {
    const user = await this.usersService.findOneById(id);

    if (user === null) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
}
