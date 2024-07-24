import { Exclude } from "class-transformer";
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
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @ManyToOne(() => Community, community => community.posts, {
    eager: true,
    onDelete: "CASCADE",
  })
  community!: Community;

  @ManyToOne(() => User, user => user.posts, {
    eager: true,
    onDelete: "CASCADE",
  })
  author!: User;

  @OneToMany(() => Vote, vote => vote.post, {
    eager: true,
    cascade: true,
  })
  votes!: Vote[];

  @OneToMany(() => Comment, comment => comment.post, {
    cascade: true,
  })
  comments!: Comment[];

  @CreateDateColumn({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
