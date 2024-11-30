import { Module } from "@nestjs/common";
import { SeederService } from "./seeder.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Community } from "src/communities/entities/community.entity";
import { Post } from "src/posts/entities/post.entity";
import { Vote } from "src/votes/entities/vote.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Reply } from "src/replies/entities/reply.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Community, Post, Vote, Comment, Reply]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
