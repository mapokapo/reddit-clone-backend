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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Post as PostEntity } from "./entities/post.entity";
import { PostsService } from "./posts.service";
import { CreatePostRequest } from "./transport/create-post.request";
import { CreatePostDto } from "./dtos/create-post.dto";
import { UpdatePostRequest } from "./transport/update-post.request";
import { UseAuth } from "src/auth/use-auth.decorator";
import { ReqUser } from "src/auth/req-user.decorator";
import { User } from "src/users/entities/user.entity";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiResponse({ status: 201, description: "Created" })
  @ApiOperation({
    summary: "Create a new post in a community",
    operationId: "create",
  })
  @UseAuth()
  @Post(":communityId")
  async create(
    @ReqUser() reqUser: User,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Body() createPostRequest: CreatePostRequest
  ): Promise<PostEntity> {
    const createPostDto = new CreatePostDto();
    createPostDto.title = createPostRequest.title;
    createPostDto.content = createPostRequest.content;
    createPostDto.communityId = communityId;

    return await this.postsService.create(reqUser, createPostDto);
  }

  @ApiResponse({
    status: 200,
    description: "OK",
    type: PostEntity,
    isArray: true,
  })
  @ApiOperation({
    summary: "Find all posts in a community",
    operationId: "findAll",
  })
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
  @ApiOperation({
    summary: "Find a post by ID in a community",
    operationId: "findOne",
  })
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
  @ApiOperation({
    summary: "Update a post in a community",
    operationId: "update",
  })
  @UseAuth()
  @Patch(":communityId/:id")
  async update(
    @ReqUser() reqUser: User,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePostRequest: UpdatePostRequest
  ): Promise<PostEntity> {
    return await this.postsService.update(
      reqUser,
      communityId,
      id,
      updatePostRequest
    );
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({
    summary: "Delete a post in a community",
    operationId: "remove",
  })
  @UseAuth()
  @Delete(":communityId/:id")
  async remove(
    @ReqUser() reqUser: User,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.remove(reqUser, communityId, id);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Upvote a post", operationId: "upvote" })
  @UseAuth()
  @Post(":communityId/:id/upvote")
  async upvote(
    @ReqUser() reqUser: User,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.vote(reqUser, communityId, id, true);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Downvote a post", operationId: "downvote" })
  @UseAuth()
  @Post(":communityId/:id/downvote")
  async downvote(
    @ReqUser() reqUser: User,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.vote(reqUser, communityId, id, false);
  }

  @ApiResponse({ status: 204, description: "No content" })
  @ApiOperation({ summary: "Remove a vote from a post", operationId: "unvote" })
  @UseAuth()
  @Delete(":communityId/:id/unvote")
  async unvote(
    @ReqUser() reqUser: User,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.unvote(reqUser, communityId, id);
  }
}
