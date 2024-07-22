import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { Comment } from "src/comments/entities/comment.entity";
import { Community } from "src/communities/entities/community.entity";
import { User } from "src/users/entities/user.entity";
import { Vote } from "src/votes/vote.entity";
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
export class Post {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose()
  @ApiProperty()
  @Column()
  title!: string;

  @Expose()
  @ApiProperty()
  @Column()
  content!: string;

  @Expose({
    name: "communityId",
  })
  @Transform(({ value }: { value: Community }) => value.id)
  @ApiProperty({
    name: "communityId",
    type: "number",
  })
  @ManyToOne(() => Community, community => community.posts, {
    eager: true,
    onDelete: "CASCADE",
  })
  community!: Community;

  @Expose({
    name: "authorId",
  })
  @Transform(({ value }: { value: User }) => value.id)
  @ApiProperty({
    name: "authorId",
    type: "number",
  })
  @ManyToOne(() => User, user => user.posts, {
    eager: true,
    onDelete: "CASCADE",
  })
  author!: User;

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
  @OneToMany(() => Vote, vote => vote.post, {
    eager: true,
    cascade: true,
  })
  votes!: Vote[];

  @OneToMany(() => Comment, comment => comment.post, {
    cascade: true,
  })
  comments!: Comment[];

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
