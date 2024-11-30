import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { Post } from "src/posts/entities/post.entity";
import { Reply } from "src/replies/entities/reply.entity";
import { User } from "src/users/entities/user.entity";
import { Vote } from "src/votes/entities/vote.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Exclude()
@Entity()
export class Comment {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose()
  @ApiProperty()
  @Column()
  content!: string;

  @Expose({
    name: "authorId",
  })
  @Transform(({ value }: { value: User }) => value.id)
  @ApiProperty({
    name: "authorId",
    type: "number",
  })
  @ManyToOne(() => User, user => user.comments, {
    eager: true,
    onDelete: "CASCADE",
  })
  author!: User;

  @Expose({
    name: "postId",
  })
  @Transform(({ value }: { value: Post }) => value.id)
  @ApiProperty({
    name: "postId",
    type: "number",
  })
  @ManyToOne(() => Post, post => post.comments, {
    eager: true,
    onDelete: "CASCADE",
  })
  post!: Post;

  // eslint-disable-next-line @darraghor/nestjs-typed/api-property-returning-array-should-set-array
  @Expose()
  @Transform(
    ({ value }: { value: Vote[] }) =>
      value.filter(v => v.isUpvote).length -
      value.filter(v => !v.isUpvote).length
  )
  @ApiProperty({
    type: "number",
  })
  @OneToMany(() => Vote, vote => vote.comment, {
    eager: true,
    cascade: true,
  })
  votes!: Vote[];

  // eslint-disable-next-line @darraghor/nestjs-typed/api-property-returning-array-should-set-array
  @Expose({
    name: "replyCount",
  })
  @Transform(({ value }: { value: Reply[] }) => value.length)
  @ApiProperty({
    name: "replyCount",
    type: "number",
  })
  @OneToMany(() => Reply, reply => reply.comment, {
    cascade: true,
  })
  replies!: Reply[];

  @Expose()
  @ApiProperty()
  @CreateDateColumn({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @Expose()
  @ApiProperty()
  @UpdateDateColumn({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
