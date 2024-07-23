import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { Comment } from "src/comments/entities/comment.entity";
import { Community } from "src/communities/entities/community.entity";
import { Post } from "src/posts/entities/post.entity";
import { Vote } from "src/votes/vote.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Exclude()
@Entity()
export class User {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose()
  @ApiProperty({
    format: "uuid",
  })
  @Column({
    unique: true,
  })
  firebaseUid!: string;

  @Expose()
  @ApiProperty({
    format: "email",
  })
  @Column({
    unique: true,
  })
  email!: string;

  @Expose()
  @ApiProperty()
  @Column()
  name!: string;

  @Expose()
  @ApiPropertyOptional({
    format: "url",
  })
  @Column({
    nullable: true,
  })
  photoUrl?: string;

  @OneToMany(() => Community, community => community.owner, {
    cascade: true,
  })
  ownedCommunities!: Community[];

  @OneToMany(() => Post, post => post.author)
  posts!: Post[];

  @OneToMany(() => Vote, vote => vote.voter)
  votes!: Vote[];

  @OneToMany(() => Comment, comment => comment.author)
  comments!: Comment[];

  @ManyToMany(() => Community, community => community.members)
  communities!: Community[];

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
