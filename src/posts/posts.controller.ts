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

  @ApiCreatedResponse({ description: "Created", type: PostEntity })
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
    summary: "Find all posts in a community",
    operationId: "findAllPosts",
  })
  @Get(":communityId")
  async findAll(
    @Param("communityId", ParseIntPipe) communityId: number
  ): Promise<PostEntity[]> {
    return await this.postsService.findAll(communityId);
  }

  @ApiOkResponse({
    description: "OK",
    type: PostEntity,
  })
  @ApiOperation({
    summary: "Find a post by ID in a community",
    operationId: "findOnePost",
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

  @ApiOkResponse({ description: "OK", type: PostEntity })
  @ApiOperation({
    summary: "Update a post in a community",
    operationId: "updatePost",
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

  @ApiNoContentResponse({ description: "No content" })
  @ApiOperation({
    summary: "Delete a post in a community",
    operationId: "removePost",
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

  @ApiNoContentResponse({ description: "No content" })
  @ApiOperation({ summary: "Upvote a post", operationId: "upvotePost" })
  @UseAuth()
  @Post(":communityId/:id/upvote")
  async upvote(
    @ReqUser() reqUser: User,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.vote(reqUser, communityId, id, true);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiOperation({ summary: "Downvote a post", operationId: "downvotePost" })
  @UseAuth()
  @Post(":communityId/:id/downvote")
  async downvote(
    @ReqUser() reqUser: User,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.vote(reqUser, communityId, id, false);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiOperation({
    summary: "Remove a vote from a post",
    operationId: "unvotePost",
  })
  @UseAuth()
  @Delete(":communityId/:id/unvote")
  async unvote(
    @ReqUser() reqUser: User,
    @Param("communityId", ParseIntPipe) communityId: number,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.postsService.unvote(reqUser, communityId, id);
  }

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
}
