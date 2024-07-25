import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { User } from "src/users/entities/user.entity";
import { Comment } from "../entities/comment.entity";

@Exclude()
export class CommentResponse {
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
  postId!: number;

  @Expose()
  @ApiProperty()
  votes!: number;

  @Expose()
  @ApiProperty()
  replyCount!: number;

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

  public static entityToResponse(
    entity: Comment,
    user?: User
  ): CommentResponse {
    const response = new CommentResponse();
    response.id = entity.id;
    response.content = entity.content;
    response.author = entity.author;
    response.postId = entity.post.id;
    response.votes =
      entity.votes.filter(vote => vote.isUpvote).length -
      entity.votes.filter(vote => !vote.isUpvote).length;
    response.replyCount = entity.replies.length;

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
