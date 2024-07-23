import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { UseAuth } from "src/auth/use-auth.decorator";
import { Comment } from "./entities/comment.entity";
import { ReqUser } from "src/auth/req-user.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateCommentRequest } from "./transport/create-comment.request";
import { UpdateCommentRequest } from "./transport/update-comment.request";

@ApiTags("comments")
@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiCreatedResponse({ description: "Created", type: Comment })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Add a comment to a post",
    operationId: "createComment",
  })
  @UseAuth()
  @Post(":postId")
  async create(
    @ReqUser() reqUser: User,
    @Param("postId", ParseIntPipe) postId: number,
    @Body() createCommentRequest: CreateCommentRequest
  ): Promise<Comment> {
    const createCommentDto = new CreateCommentDto();
    createCommentDto.content = createCommentRequest.content;
    createCommentDto.parentId = createCommentRequest.parentId ?? null;
    createCommentDto.postId = postId;

    return await this.commentsService.create(reqUser, createCommentDto);
  }

  @ApiOkResponse({ description: "OK", type: Comment, isArray: true })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Get all comments for a post",
    operationId: "findAllComments",
  })
  @ApiQuery({
    name: "depth",
    type: Number,
    required: false,
    description: "The depth of the comment tree to return",
  })
  @Get("posts/:postId")
  async findAll(
    @Param("postId", ParseIntPipe) postId: number,
    @Query("depth", new DefaultValuePipe(5)) depth = 5
  ): Promise<Comment[]> {
    return await this.commentsService.findAll(postId, depth);
  }

  @ApiOkResponse({ description: "OK", type: Comment })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Get a comment by ID",
    operationId: "findCommentById",
  })
  @ApiQuery({
    name: "depth",
    type: Number,
    required: false,
    description: "The depth of the comment tree to return",
  })
  @Get(":commentId")
  async findOne(
    @Param("commentId", ParseIntPipe) commentId: number,
    @Query("depth", new DefaultValuePipe(5)) depth = 5
  ): Promise<Comment> {
    return await this.commentsService.findOne(commentId, depth);
  }

  @ApiOkResponse({ description: "OK", type: Comment })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Update a comment",
    operationId: "updateComment",
  })
  @UseAuth()
  @Patch(":commentId")
  async update(
    @ReqUser() reqUser: User,
    @Param("commentId", ParseIntPipe) commentId: number,
    @Body() updateCommentRequest: UpdateCommentRequest
  ): Promise<Comment> {
    const updateCommentDto = new UpdateCommentDto();
    updateCommentDto.content = updateCommentRequest.content;

    return await this.commentsService.update(
      reqUser,
      commentId,
      updateCommentDto
    );
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Delete a comment",
    operationId: "deleteComment",
  })
  @UseAuth()
  @Delete(":commentId")
  async remove(
    @ReqUser() reqUser: User,
    @Param("commentId", ParseIntPipe) commentId: number
  ): Promise<void> {
    await this.commentsService.remove(reqUser, commentId);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({ summary: "Upvote a comment", operationId: "upvoteComment" })
  @UseAuth()
  @Post(":id/upvote")
  async upvote(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.commentsService.vote(reqUser, id, true);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Downvote a comment",
    operationId: "downvoteComment",
  })
  @UseAuth()
  @Post(":id/downvote")
  async downvote(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.commentsService.vote(reqUser, id, false);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Remove a vote from a comment",
    operationId: "unvoteComment",
  })
  @UseAuth()
  @Delete(":id/unvote")
  async unvote(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.commentsService.unvote(reqUser, id);
  }
}
