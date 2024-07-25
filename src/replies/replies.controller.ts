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
import { CreateReplyRequest } from "./transport/create-reply.request";
import { UpdateReplyRequest } from "./transport/update-reply.request";
import { ReplyResponse } from "./transport/reply.response";
import { ReqMaybeUser } from "src/auth/req-maybe-user.decorator";
import { RepliesService } from "./replies.service";
import { CreateReplyDto } from "./dto/create-reply.dto";
import { UpdateReplyDto } from "./dto/update-reply.dto";

@ApiTags("replies")
@Controller("replies")
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @ApiCreatedResponse({ description: "Created", type: ReplyResponse })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Add a reply to a comment",
    operationId: "createReply",
  })
  @UseAuth()
  @Post(":commentId")
  async create(
    @ReqUser() reqUser: User,
    @Param("commentId", ParseIntPipe) commentId: number,
    @Body() createReplyRequest: CreateReplyRequest
  ): Promise<ReplyResponse> {
    const createReplyDto = new CreateReplyDto();
    createReplyDto.content = createReplyRequest.content;
    createReplyDto.commentId = commentId;

    const reply = await this.repliesService.create(reqUser, createReplyDto);

    return ReplyResponse.entityToResponse(reply, reqUser);
  }

  @ApiOkResponse({ description: "OK", type: ReplyResponse, isArray: true })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Get all replies for a comment",
    operationId: "findAllReplies",
  })
  @UseAuth("maybe")
  @Get("comments/:commentId")
  async findAll(
    @ReqMaybeUser() reqMaybeUser: User | null,
    @Param("commentId", ParseIntPipe) commentId: number
  ): Promise<ReplyResponse[]> {
    const replies = await this.repliesService.findAll(commentId);

    return replies.map(reply =>
      ReplyResponse.entityToResponse(reply, reqMaybeUser ?? undefined)
    );
  }

  @ApiOkResponse({ description: "OK", type: ReplyResponse })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Get a reply by id",
    operationId: "findOneReply",
  })
  @UseAuth("maybe")
  @Get(":replyId")
  async findOne(
    @ReqMaybeUser() reqMaybeUser: User | null,
    @Param("replyId", ParseIntPipe) replyId: number
  ): Promise<ReplyResponse> {
    const reply = await this.repliesService.findOne(replyId);

    if (reply === null) {
      throw new NotFoundException("Reply not found");
    }

    return ReplyResponse.entityToResponse(reply, reqMaybeUser ?? undefined);
  }

  @ApiOkResponse({ description: "OK", type: ReplyResponse })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Update a reply",
    operationId: "updateReply",
  })
  @UseAuth()
  @Patch(":replyId")
  async update(
    @ReqUser() reqUser: User,
    @Param("replyId", ParseIntPipe) replyId: number,
    @Body() updateReplyRequest: UpdateReplyRequest
  ): Promise<ReplyResponse> {
    const updateReplyDto = new UpdateReplyDto();
    updateReplyDto.content = updateReplyRequest.content;

    const reply = await this.repliesService.update(
      reqUser,
      replyId,
      updateReplyDto
    );

    return ReplyResponse.entityToResponse(reply, reqUser);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Delete a reply",
    operationId: "deleteReply",
  })
  @UseAuth()
  @Delete(":replyId")
  async remove(
    @ReqUser() reqUser: User,
    @Param("replyId", ParseIntPipe) replyId: number
  ): Promise<void> {
    await this.repliesService.remove(reqUser, replyId);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Vote a reply up or down",
    operationId: "voteReply",
  })
  @UseAuth()
  @Post(":id/vote")
  async vote(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number,
    @Query("isUpvote", ParseBoolPipe) isUpvote: boolean
  ): Promise<void> {
    await this.repliesService.vote(reqUser, id, isUpvote);
  }

  @ApiNoContentResponse({ description: "No content" })
  @ApiNotFoundResponse({ description: "Not found" })
  @ApiOperation({
    summary: "Remove a vote from a reply",
    operationId: "unvoteReply",
  })
  @UseAuth()
  @Delete(":id/unvote")
  async unvote(
    @ReqUser() reqUser: User,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.repliesService.unvote(reqUser, id);
  }
}
