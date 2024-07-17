import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Exclude()
@Entity()
export class Community {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose()
  @ApiProperty()
  @Column()
  name!: string;

  @Expose()
  @ApiProperty()
  @Column()
  description!: string;

  @Expose({
    name: "ownerId",
  })
  @Transform(({ value }: { value: User }) => value.id)
  @ManyToOne(() => User, user => user.ownedCommunities, {
    eager: true,
    onDelete: "CASCADE",
  })
  owner!: User;

  @OneToMany(() => Post, post => post.community)
  posts!: Post[];

  @ManyToMany(() => User, user => user.communities)
  @JoinTable({
    name: "community_members",
    joinColumn: { name: "community_id" },
    inverseJoinColumn: { name: "user_id" },
  })
  members!: User[];

  @Expose()
  @ApiProperty()
  @Column()
  createdAt!: Date;
}
