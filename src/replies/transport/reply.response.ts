import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { User } from "src/users/entities/user.entity";
import { Reply } from "../entities/reply.entity";

@Exclude()
export class ReplyResponse {
  @Expose()
  @ApiProperty()
  id!: number;

  @Expose()
  @ApiProperty()
  content!: string;

  @Expose()
  @ApiProperty()
  author!: User;

  @Expose()
  @ApiProperty()
  commentId!: number;

  @Expose()
  @ApiProperty()
  votes!: number;

  @Expose()
  @ApiProperty({
    oneOf: [{ type: "boolean" }, { type: "null" }],
  })
  upvoted!: boolean | null;

  @Expose()
  @ApiProperty()
  createdAt!: Date;

  @Expose()
  @ApiProperty()
  updatedAt!: Date;

  public static entityToResponse(entity: Reply, user?: User): ReplyResponse {
    const response = new ReplyResponse();
    response.id = entity.id;
    response.content = entity.content;
    response.author = entity.author;
    response.commentId = entity.comment.id;
    response.votes =
      entity.votes.filter(vote => vote.isUpvote).length -
      entity.votes.filter(vote => !vote.isUpvote).length;

    // true if user voted and value is true, false if user voted and value is false, null if user has not voted or if user is not provided
    if (user) {
      const userVote = entity.votes.find(vote => vote.voter.id === user.id);
      response.upvoted = userVote !== undefined ? userVote.isUpvote : null;
    } else {
      response.upvoted = null;
    }

    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;

    return response;
  }
}
