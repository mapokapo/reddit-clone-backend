import { Exclude } from "class-transformer";
import { Comment } from "src/comments/entities/comment.entity";
import { Post } from "src/posts/entities/post.entity";
import { Reply } from "src/replies/entities/reply.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Exclude()
@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.votes, {
    eager: true,
    onDelete: "CASCADE",
  })
  voter!: User;

  @ManyToOne(() => Post, post => post.votes, {
    onDelete: "CASCADE",
    nullable: true,
  })
  post?: Post;

  @ManyToOne(() => Comment, comment => comment.votes, {
    onDelete: "CASCADE",
    nullable: true,
  })
  comment?: Comment;

  @ManyToOne(() => Reply, reply => reply.votes, {
    onDelete: "CASCADE",
    nullable: true,
  })
  reply?: Reply;

  @Column()
  isUpvote!: boolean;
}
