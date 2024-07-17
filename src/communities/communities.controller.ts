import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  NotFoundException,
} from "@nestjs/common";
import { CommunitiesService } from "./communities.service";
import { CreateCommunityRequest } from "./transport/create-community.request";
import { UpdateCommunityRequest } from "./transport/update-community.request";
import { AuthGuard } from "src/auth/auth.guard";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthenticatedRequest } from "src/auth/authenticated-request";
import { CreateCommunityDto } from "./dtos/create-community.dto";
import { Community } from "./entities/community.entity";

@ApiTags("communities")
@Controller("communities")
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @ApiResponse({ status: 201, description: "Created" })
  @ApiOperation({
    summary: "Create a new community",
    operationId: "create",
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createCommunityRequest: CreateCommunityRequest
  ): Promise<Community> {
    const createCommunityDto = new CreateCommunityDto();
    createCommunityDto.name = createCommunityRequest.name;
    createCommunityDto.description = createCommunityRequest.description;

    return await this.communitiesService.create(req.user, createCommunityDto);
  }

  @ApiResponse({
    status: 200,
    description: "OK",
    type: Community,
    isArray: true,
  })
  @ApiOperation({ summary: "Find all communities" })
  @Get()
  async findAll(): Promise<Community[]> {
    return await this.communitiesService.findAll();
  }

  @ApiResponse({
    status: 200,
    description: "OK",
    type: Community,
  })
  @ApiOperation({ summary: "Find a community by ID" })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Community> {
    const community = await this.communitiesService.findOne(id);

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    return community;
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Update a community" })
  @UseGuards(AuthGuard)
  @Patch(":id")
  async update(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCommunityRequest: UpdateCommunityRequest
  ): Promise<Community> {
    return await this.communitiesService.update(
      req.user,
      id,
      updateCommunityRequest
    );
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Delete a community" })
  @UseGuards(AuthGuard)
  @Delete(":id")
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.communitiesService.remove(req.user, id);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Join a community" })
  @UseGuards(AuthGuard)
  @Post(":id/join")
  async join(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.communitiesService.join(req.user, id);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Leave a community" })
  @UseGuards(AuthGuard)
  @Post(":id/leave")
  async leave(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.communitiesService.leave(req.user, id);
  }
}
