import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { Community } from "src/communities/entities/community.entity";
import { Post } from "src/posts/entities/post.entity";
import { Session } from "src/sessions/entities/session.entity";
import { Vote } from "src/votes/vote.entity";
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Exclude()
@Entity()
export class User {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose()
  @ApiProperty()
  @Column({
    unique: true,
  })
  email!: string;

  @Expose()
  @ApiProperty()
  @Column({
    unique: true,
  })
  username!: string;

  @Column()
  passwordHash!: string;

  @OneToMany(() => Session, session => session.user)
  sessions!: Session[];

  @OneToMany(() => Community, community => community.owner)
  ownedCommunities!: Community[];

  @OneToMany(() => Post, post => post.author)
  posts!: Post[];

  @OneToMany(() => Vote, vote => vote.voter)
  votes!: Vote[];

  @ManyToMany(() => Community, community => community.members)
  communities!: Community[];
}
