import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { Vote } from "src/votes/vote.entity";
import { Post } from "src/posts/entities/post.entity";
import { AuthModule } from "src/auth/auth.module";
import { FirebaseModule } from "src/firebase/firebase.module";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [
    AuthModule,
    FirebaseModule,
    TypeOrmModule.forFeature([Comment, Vote, Post]),
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
