import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { Post as PostEntity } from "../entities/post.entity";
import { User } from "src/users/entities/user.entity";

@Exclude()
export class PostResponse {
  @Expose()
  @ApiProperty()
  id!: number;

  @Expose()
  @ApiProperty()
  title!: string;

  @Expose()
  @ApiProperty()
  content!: string;

  @Expose()
  @ApiProperty()
  communityId!: number;

  @Expose()
  @ApiProperty()
  communityName!: string;

  @Expose()
  @ApiProperty({
    oneOf: [{ type: "boolean" }, { type: "null" }],
  })
  upvoted!: boolean | null;

  @Expose()
  @ApiProperty()
  authorId!: number;

  @Expose()
  @ApiProperty()
  votes!: number;

  @Expose()
  @ApiProperty()
  createdAt!: Date;

  @Expose()
  @ApiProperty()
  updatedAt!: Date;

  public static entityToResponse(
    entity: PostEntity,
    user?: User
  ): PostResponse {
    const response = new PostResponse();
    response.id = entity.id;
    response.title = entity.title;
    response.content = entity.content;
    response.communityId = entity.community.id;
    response.communityName = entity.community.name;
    // true if user voted and value is true, false if user voted and value is false, null if user has not voted or if user is not provided
    if (user) {
      const userVote = entity.votes.find(vote => vote.voter.id === user.id);
      response.upvoted = userVote !== undefined ? userVote.isUpvote : null;
    } else {
      response.upvoted = null;
    }
    response.authorId = entity.author.id;
    response.votes =
      entity.votes.filter(vote => vote.isUpvote).length -
      entity.votes.filter(vote => !vote.isUpvote).length;

    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;

    return response;
  }
}
