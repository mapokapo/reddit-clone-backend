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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateCommunityDto } from "./dtos/create-community.dto";
import { Community } from "./entities/community.entity";
import { UseAuth } from "src/auth/use-auth.decorator";
import { ReqUser } from "src/auth/req-user.decorator";
import { User } from "src/users/entities/user.entity";

@ApiTags("communities")
@Controller("communities")
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @ApiResponse({ status: 201, description: "Created" })
  @ApiOperation({
    summary: "Create a new community",
    operationId: "create",
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

  @ApiResponse({
    status: 200,
    description: "OK",
    type: Community,
    isArray: true,
  })
  @ApiOperation({ summary: "Find all communities", operationId: "findAll" })
  @Get()
  async findAll(): Promise<Community[]> {
    return await this.communitiesService.findAll();
  }

  @ApiResponse({
    status: 200,
    description: "OK",
    type: Community,
  })
  @ApiOperation({ summary: "Find a community by ID", operationId: "findOne" })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Community> {
    const community = await this.communitiesService.findOne(id);

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    return community;
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Update a community", operationId: "update" })
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

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Delete a community", operationId: "remove" })
  @UseAuth()
  @Delete(":id")
  async remove(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.communitiesService.remove(reqUser, id);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Join a community", operationId: "join" })
  @UseAuth()
  @Post(":id/join")
  async join(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.communitiesService.join(reqUser, id);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Leave a community", operationId: "leave" })
  @UseAuth()
  @Post(":id/leave")
  async leave(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.communitiesService.leave(reqUser, id);
  }
}
