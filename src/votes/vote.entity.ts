import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.votes, {
    onDelete: "CASCADE",
  })
  voter!: User;

  @ManyToOne(() => Post, post => post.votes, {
    onDelete: "CASCADE",
  })
  post!: Post;

  @Column()
  isUpvote!: boolean;
}
