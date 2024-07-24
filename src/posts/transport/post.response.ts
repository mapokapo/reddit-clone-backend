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
    response.upvoted =
      user === undefined
        ? null
        : entity.votes.some(vote => vote.voter.id === user.id);
    response.authorId = entity.author.id;
    response.votes = entity.votes.length;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;

    return response;
  }
}
