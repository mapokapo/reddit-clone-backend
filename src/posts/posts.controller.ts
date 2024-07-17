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
import { AuthGuard } from "src/auth/auth.guard";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthenticatedRequest } from "src/auth/authenticated-request";
import { Post as PostEntity } from "./entities/post.entity";
import { PostsService } from "./posts.service";
import { CreatePostRequest } from "./transport/create-post.request";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostRequest } from "./transport/update-post.request";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiResponse({ status: 201, description: "Created" })
  @ApiOperation({
    summary: "Create a new post in a community",
    operationId: "create",
  })
  @UseGuards(AuthGuard)
  @Post(":communityId")
  async create(
    @Req() req: AuthenticatedRequest,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Body() createPostRequest: CreatePostRequest
  ): Promise<PostEntity> {
    const createPostDto = new CreatePostDto();
    createPostDto.title = createPostRequest.title;
    createPostDto.content = createPostRequest.content;
    createPostDto.communityId = communityId;

    return await this.postsService.create(req.user, createPostDto);
  }

  @ApiResponse({
    status: 200,
    description: "OK",
    type: PostEntity,
    isArray: true,
  })
  @ApiOperation({ summary: "Find all posts in a community" })
  @Get(":communityId")
  async findAll(
    @Param("communityId", ParseIntPipe) communityId: number
  ): Promise<PostEntity[]> {
    return await this.postsService.findAll(communityId);
  }

  @ApiResponse({
    status: 200,
    description: "OK",
    type: PostEntity,
  })
  @ApiOperation({ summary: "Find a post by ID in a community" })
  @Get(":communityId/:id")
  async findOne(
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<PostEntity> {
    const post = await this.postsService.findOne(communityId, id);

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Update a post in a community" })
  @UseGuards(AuthGuard)
  @Patch(":communityId/:id")
  async update(
    @Req() req: AuthenticatedRequest,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePostRequest: UpdatePostRequest
  ): Promise<PostEntity> {
    return await this.postsService.update(
      req.user,
      communityId,
      id,
      updatePostRequest
    );
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Delete a post in a community" })
  @UseGuards(AuthGuard)
  @Delete(":communityId/:id")
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.remove(req.user, communityId, id);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Upvote a post" })
  @UseGuards(AuthGuard)
  @Post(":communityId/:id/upvote")
  async upvote(
    @Req() req: AuthenticatedRequest,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.vote(req.user, communityId, id, true);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Downvote a post" })
  @UseGuards(AuthGuard)
  @Post(":communityId/:id/downvote")
  async downvote(
    @Req() req: AuthenticatedRequest,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.vote(req.user, communityId, id, false);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Remove a vote from a post" })
  @UseGuards(AuthGuard)
  @Delete(":communityId/:id/unvote")
  async unvote(
    @Req() req: AuthenticatedRequest,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.unvote(req.user, communityId, id);
  }
}
