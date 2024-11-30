import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { Vote as VoteEntity } from "../entities/vote.entity";

@Exclude()
export class VoteResponse {
  @Expose()
  @ApiProperty()
  id!: number;

  @Expose()
  @ApiProperty()
  voterId!: number;

  @Expose()
  @ApiPropertyOptional()
  postId?: number;

  @Expose()
  @ApiPropertyOptional()
  commentId?: number;

  @Expose()
  @ApiPropertyOptional()
  replyId?: number;

  @Expose()
  @ApiProperty()
  isUpvote!: boolean;

  public static entityToResponse(entity: VoteEntity): VoteResponse {
    const response = new VoteResponse();

    response.id = entity.id;
    response.voterId = entity.voter.id;
    response.postId = entity.post?.id;
    response.commentId = entity.comment?.id;
    response.replyId = entity.reply?.id;
    response.isUpvote = entity.isUpvote;

    return response;
  }
}
