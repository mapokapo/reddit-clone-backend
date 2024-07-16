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
    return this.communitiesService.findAll();
  }

  @ApiResponse({
    status: 200,
    description: "OK",
    type: Community,
  })
  @ApiOperation({ summary: "Find a community by ID" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.communitiesService.findOne(+id);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Update a community" })
  @UseGuards(AuthGuard)
  @Patch(":id")
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCommunityDto: UpdateCommunityRequest
  ) {
    return this.communitiesService.update(req.user, id, updateCommunityDto);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Delete a community" })
  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(
    @Req() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.communitiesService.remove(req.user, id);
  }
}
