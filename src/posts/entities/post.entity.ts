import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { Community } from "src/communities/entities/community.entity";
import { User } from "src/users/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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
  @ManyToOne(() => Community, community => community.posts, {
    eager: true,
    onDelete: "CASCADE",
  })
  community!: Community;

  @Expose({
    name: "authorId",
  })
  @Transform(({ value }: { value: User }) => value.id)
  @ManyToOne(() => User, user => user.posts, {
    eager: true,
    onDelete: "CASCADE",
  })
  author!: User;

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
