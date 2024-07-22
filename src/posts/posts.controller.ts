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
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
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

  @ApiOkResponse({
    description: "OK",
    type: PostEntity,
    isArray: true,
  })
  @ApiOperation({
    summary: "Get a personalized feed of posts for the current user",
    operationId: "getFeed",
  })
  @UseAuth()
  @Get("feed")
  async getFeed(@ReqUser() reqUser: User): Promise<PostEntity[]> {
    return await this.postsService.getFeed(reqUser);
  }

  @ApiCreatedResponse({ description: "Created", type: PostEntity })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Create a new post in a community",
    operationId: "createPost",
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

  @ApiOkResponse({
    description: "OK",
    type: PostEntity,
    isArray: true,
  })
  @ApiOperation({
    summary: "Find all posts by a user",
    operationId: "findAllPostsByUser",
  })
  @Get("user/:userId")
  async findAllByUser(
    @Param("userId", ParseIntPipe) userId: number
  ): Promise<PostEntity[]> {
    return await this.postsService.findAllByUser(userId);
  }

  @ApiOkResponse({
    description: "OK",
    type: PostEntity,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Find all posts in a community",
    operationId: "findAllPosts",
  })
  @Get("community/:communityId")
  async findAll(
    @Param("communityId", ParseIntPipe) communityId: number
  ): Promise<PostEntity[]> {
    return await this.postsService.findAll(communityId);
  }

  @ApiOkResponse({
    description: "OK",
    type: PostEntity,
  })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Find a post by ID",
    operationId: "findOnePost",
  })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<PostEntity> {
    const post = await this.postsService.findOne(id);

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }

  @ApiOkResponse({ description: "OK", type: PostEntity })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Update a post",
    operationId: "updatePost",
  })
  @UseAuth()
  @Patch(":id")
  async update(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePostRequest: UpdatePostRequest
  ): Promise<PostEntity> {
    return await this.postsService.update(reqUser, id, updatePostRequest);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Delete a post",
    operationId: "removePost",
  })
  @UseAuth()
  @Delete(":id")
  async remove(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.remove(reqUser, id);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({ summary: "Upvote a post", operationId: "upvotePost" })
  @UseAuth()
  @Post(":id/upvote")
  async upvote(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.vote(reqUser, id, true);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({ summary: "Downvote a post", operationId: "downvotePost" })
  @UseAuth()
  @Post(":id/downvote")
  async downvote(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.vote(reqUser, id, false);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Remove a vote from a post",
    operationId: "unvotePost",
  })
  @UseAuth()
  @Delete(":id/unvote")
  async unvote(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.unvote(reqUser, id);
  }
}
