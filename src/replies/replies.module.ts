import { Module } from "@nestjs/common";
import { RepliesService } from "./replies.service";
import { RepliesController } from "./replies.controller";
import { AuthModule } from "src/auth/auth.module";
import { FirebaseModule } from "src/firebase/firebase.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reply } from "./entities/reply.entity";
import { Vote } from "src/votes/entities/vote.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [
    AuthModule,
    FirebaseModule,
    TypeOrmModule.forFeature([Reply, Comment, Vote]),
    UsersModule,
  ],
  controllers: [RepliesController],
  providers: [RepliesService],
})
export class RepliesModule {}
