import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { Comment } from "src/comments/entities/comment.entity";
import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Exclude()
@Entity()
export class Vote {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose({
    name: "voterId",
  })
  @Transform(({ value }: { value: User }) => value.id)
  @ApiProperty({
    name: "voterId",
    type: "number",
  })
  @ManyToOne(() => User, user => user.votes, {
    eager: true,
    onDelete: "CASCADE",
  })
  voter!: User;

  @Expose({
    name: "postId",
  })
  @Transform(({ value }: { value: Post }) => value.id)
  @ApiPropertyOptional({
    name: "postId",
    type: "number",
  })
  @ManyToOne(() => Post, post => post.votes, {
    onDelete: "CASCADE",
    nullable: true,
  })
  post?: Post;

  @Expose({
    name: "commentId",
  })
  @Transform(({ value }: { value: Comment }) => value.id)
  @ApiPropertyOptional({
    name: "commentId",
    type: "number",
  })
  @ManyToOne(() => Comment, comment => comment.votes, {
    onDelete: "CASCADE",
    nullable: true,
  })
  comment?: Comment;

  @Expose()
  @ApiProperty()
  @Column()
  isUpvote!: boolean;
}
