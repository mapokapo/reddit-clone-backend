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
  Query,
  ParseBoolPipe,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { PostsService } from "./posts.service";
import { CreatePostRequest } from "./transport/create-post.request";
import { CreatePostDto } from "./dtos/create-post.dto";
import { UpdatePostRequest } from "./transport/update-post.request";
import { UseAuth } from "src/auth/use-auth.decorator";
import { ReqUser } from "src/auth/req-user.decorator";
import { User } from "src/users/entities/user.entity";
import { PostResponse } from "./transport/post.response";
import { ReqMaybeUser } from "src/auth/req-maybe-user.decorator";
import { FilterOptionsQuery } from "./transport/filter-options.query";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOkResponse({
    description: "OK",
    type: PostResponse,
    isArray: true,
  })
  @ApiOperation({
    summary: "Get a personalized feed of posts for the current user",
    operationId: "getFeed",
  })
  @UseAuth()
  @Get("feed")
  async getFeed(
    @ReqUser() reqUser: User,
    @Query() filterOptions: FilterOptionsQuery
  ): Promise<PostResponse[]> {
    const feed = await this.postsService.getFeed(reqUser, filterOptions);

    return feed.map(post => PostResponse.entityToResponse(post, reqUser));
  }

  @ApiCreatedResponse({ description: "Created", type: PostResponse })
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
  ): Promise<PostResponse> {
    const createPostDto = new CreatePostDto();
    createPostDto.title = createPostRequest.title;
    createPostDto.content = createPostRequest.content;
    createPostDto.communityId = communityId;

    const postEntity = await this.postsService.create(reqUser, createPostDto);

    return PostResponse.entityToResponse(postEntity, reqUser);
  }

  @ApiOkResponse({
    description: "OK",
    type: PostResponse,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Find all posts from communities the user can access",
    operationId: "findAllPosts",
  })
  @UseAuth("maybe")
  @Get("all")
  async findAll(
    @ReqMaybeUser() reqMaybeUser: User | null
  ): Promise<PostResponse[]> {
    const postEntities = await this.postsService.findAll();

    return postEntities.map(post =>
      PostResponse.entityToResponse(post, reqMaybeUser ?? undefined)
    );
  }

  @ApiOkResponse({
    description: "OK",
    type: PostResponse,
    isArray: true,
  })
  @ApiOperation({
    summary: "Find all posts by a user",
    operationId: "findAllPostsByUser",
  })
  @UseAuth("maybe")
  @Get("user/:userId")
  async findAllByUser(
    @ReqMaybeUser() reqMaybeUser: User | null,
    @Query() filterOptions: FilterOptionsQuery,
    @Param("userId", ParseIntPipe) userId: number
  ): Promise<PostResponse[]> {
    const postEntities = await this.postsService.findAllByUser(
      userId,
      filterOptions
    );

    return postEntities.map(post =>
      PostResponse.entityToResponse(post, reqMaybeUser ?? undefined)
    );
  }

  @ApiOkResponse({
    description: "OK",
    type: PostResponse,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Find all posts in a community",
    operationId: "findAllPostsInCommunity",
  })
  @UseAuth("maybe")
  @Get("community/:communityId")
  async findAllInCommunity(
    @ReqMaybeUser() reqMaybeUser: User | null,
    @Query() filterOptions: FilterOptionsQuery,
    @Param("communityId", ParseIntPipe) communityId: number
  ): Promise<PostResponse[]> {
    const postEntities = await this.postsService.findAllInCommunity(
      communityId,
      filterOptions
    );

    return postEntities.map(post =>
      PostResponse.entityToResponse(post, reqMaybeUser ?? undefined)
    );
  }

  @ApiOkResponse({
    description: "OK",
    type: PostResponse,
  })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Find a post by ID",
    operationId: "findOnePost",
  })
  @UseAuth("maybe")
  @Get(":id")
  async findOne(
    @ReqMaybeUser() reqMaybeUser: User | null,
    @Param("id", ParseIntPipe) id: number
  ): Promise<PostResponse> {
    const post = await this.postsService.findOne(id);

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    return PostResponse.entityToResponse(post, reqMaybeUser ?? undefined);
  }

  @ApiOkResponse({ description: "OK", type: PostResponse })
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
  ): Promise<PostResponse> {
    const postEntity = await this.postsService.update(
      reqUser,
      id,
      updatePostRequest
    );

    return PostResponse.entityToResponse(postEntity, reqUser);
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
  @ApiOperation({ summary: "Vote a post up or down", operationId: "votePost" })
  @UseAuth()
  @Post(":id/vote")
  async vote(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number,
    @Query("isUpvote", ParseBoolPipe) isUpvote: boolean
  ): Promise<void> {
    await this.postsService.vote(reqUser, id, isUpvote);
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
