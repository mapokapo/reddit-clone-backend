import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from "@nestjs/common";
import { CommunitiesService } from "./communities.service";
import { CreateCommunityRequest } from "./transport/create-community.request";
import { UpdateCommunityRequest } from "./transport/update-community.request";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CreateCommunityDto } from "./dtos/create-community.dto";
import { Community } from "./entities/community.entity";
import { UseAuth } from "src/auth/use-auth.decorator";
import { ReqUser } from "src/auth/req-user.decorator";
import { User } from "src/users/entities/user.entity";
import { ReqMaybeUser } from "src/auth/req-maybe-user.decorator";

@ApiTags("communities")
@Controller("communities")
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @ApiCreatedResponse({ description: "Created", type: Community })
  @ApiOperation({
    summary: "Create a new community",
    operationId: "createCommunity",
  })
  @UseAuth()
  @Post()
  async create(
    @ReqUser() reqUser: User,
    @Body() createCommunityRequest: CreateCommunityRequest
  ): Promise<Community> {
    const createCommunityDto = new CreateCommunityDto();
    createCommunityDto.name = createCommunityRequest.name;
    createCommunityDto.description = createCommunityRequest.description;

    return await this.communitiesService.create(reqUser, createCommunityDto);
  }

  @ApiOkResponse({ description: "OK", type: String })
  @ApiNotFoundResponse({ description: "Community not found" })
  @ApiOperation({
    summary: "Check if a user is a member of a community",
    operationId: "checkUserMembership",
  })
  @UseAuth()
  @Get(":id/membership")
  async checkUserMembership(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<string> {
    return await this.communitiesService.checkUserMembership(reqUser, id);
  }

  @ApiOkResponse({
    description: "OK",
    type: Community,
    isArray: true,
  })
  @ApiOperation({
    summary: "Find all communities the user can see",
    operationId: "findAllCommunities",
  })
  @UseAuth("maybe")
  @Get()
  async findAll(
    @ReqMaybeUser() reqMaybeUser: User | null
  ): Promise<Community[]> {
    return await this.communitiesService.findAll(reqMaybeUser);
  }

  @ApiOkResponse({
    description: "OK",
    type: Community,
    isArray: true,
  })
  @ApiOperation({
    summary: "Find all communities that the current user is a member of",
    operationId: "findUserCommunities",
  })
  @UseAuth()
  @Get("me")
  async findUserCommunities(@ReqUser() reqUser: User): Promise<Community[]> {
    return await this.communitiesService.findUserCommunities(reqUser);
  }

  @ApiOkResponse({
    description: "OK",
    type: Community,
  })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Find a community by ID",
    operationId: "findOneCommunity",
  })
  @UseAuth("maybe")
  @Get(":id")
  async findOne(
    @ReqMaybeUser() reqMaybeUser: User | null,
    @Param("id", ParseIntPipe) id: number
  ): Promise<Community> {
    const community = await this.communitiesService.findOne(reqMaybeUser, id);

    if (community === null) {
      throw new NotFoundException("Not found");
    }

    return community;
  }

  @ApiOkResponse({ description: "OK", type: Community })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Update a community",
    operationId: "updateCommunity",
  })
  @UseAuth()
  @Patch(":id")
  async update(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCommunityRequest: UpdateCommunityRequest
  ): Promise<Community> {
    return await this.communitiesService.update(
      reqUser,
      id,
      updateCommunityRequest
    );
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Delete a community",
    operationId: "removeCommunity",
  })
  @UseAuth()
  @Delete(":id")
  async remove(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.communitiesService.remove(reqUser, id);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({ summary: "Join a community", operationId: "joinCommunity" })
  @UseAuth()
  @Post(":id/join")
  async join(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.communitiesService.join(reqUser, id);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({ summary: "Leave a community", operationId: "leaveCommunity" })
  @UseAuth()
  @Post(":id/leave")
  async leave(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.communitiesService.leave(reqUser, id);
  }
}
