import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { Comment } from "src/comments/entities/comment.entity";
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
export class Reply {
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
  @ManyToOne(() => User, user => user.replies, {
    eager: true,
    onDelete: "CASCADE",
  })
  author!: User;

  @Expose({
    name: "commentId",
  })
  @Transform(({ value }: { value: Comment }) => value.id)
  @ApiProperty({
    name: "commentId",
    type: "number",
  })
  @ManyToOne(() => Comment, comment => comment.replies, {
    eager: true,
    onDelete: "CASCADE",
  })
  comment!: Comment;

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
  @OneToMany(() => Vote, vote => vote.reply, {
    eager: true,
    cascade: true,
  })
  votes!: Vote[];

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
