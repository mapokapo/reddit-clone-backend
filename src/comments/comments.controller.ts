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
  ParseBoolPipe,
  NotFoundException,
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
  ApiTags,
} from "@nestjs/swagger";
import { UseAuth } from "src/auth/use-auth.decorator";
import { ReqUser } from "src/auth/req-user.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateCommentRequest } from "./transport/create-comment.request";
import { UpdateCommentRequest } from "./transport/update-comment.request";
import { CommentResponse } from "./transport/comment.response";
import { ReqMaybeUser } from "src/auth/req-maybe-user.decorator";
import { FilterOptionsQuery } from "src/posts/transport/filter-options.query";

@ApiTags("comments")
@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiCreatedResponse({ description: "Created", type: CommentResponse })
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
  ): Promise<CommentResponse> {
    const createCommentDto = new CreateCommentDto();
    createCommentDto.content = createCommentRequest.content;
    createCommentDto.postId = postId;

    const comment = await this.commentsService.create(
      reqUser,
      createCommentDto
    );

    return CommentResponse.entityToResponse(comment, reqUser);
  }

  @ApiOkResponse({ description: "OK", type: CommentResponse, isArray: true })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Get all comments for a post",
    operationId: "findAllComments",
  })
  @UseAuth("maybe")
  @Get("posts/:postId")
  async findAll(
    @ReqMaybeUser() reqMaybeUser: User | null,
    @Param("postId", ParseIntPipe) postId: number,
    @Query() filterOptions: FilterOptionsQuery
  ): Promise<CommentResponse[]> {
    const comments = await this.commentsService.findAll(postId, filterOptions);

    return comments.map(comment =>
      CommentResponse.entityToResponse(comment, reqMaybeUser ?? undefined)
    );
  }

  @ApiOkResponse({ description: "OK", type: CommentResponse })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Get a comment by ID",
    operationId: "findCommentById",
  })
  @UseAuth("maybe")
  @Get(":commentId")
  async findOne(
    @ReqMaybeUser() reqMaybeUser: User | null,
    @Param("commentId", ParseIntPipe) commentId: number
  ): Promise<CommentResponse> {
    const comment = await this.commentsService.findOne(commentId);

    if (comment === null) {
      throw new NotFoundException("Comment not found");
    }

    return CommentResponse.entityToResponse(comment, reqMaybeUser ?? undefined);
  }

  @ApiOkResponse({ description: "OK", type: CommentResponse })
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
  ): Promise<CommentResponse> {
    const updateCommentDto = new UpdateCommentDto();
    updateCommentDto.content = updateCommentRequest.content;

    const comment = await this.commentsService.update(
      reqUser,
      commentId,
      updateCommentDto
    );

    return CommentResponse.entityToResponse(comment, reqUser);
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
  @ApiOperation({
    summary: "Vote a comment up or down",
    operationId: "voteComment",
  })
  @UseAuth()
  @Post(":id/vote")
  async vote(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number,
    @Query("isUpvote", ParseBoolPipe) isUpvote: boolean
  ): Promise<void> {
    await this.commentsService.vote(reqUser, id, isUpvote);
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
