import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersController } from "./users.controller";
import { AuthModule } from "src/auth/auth.module";
import { FirebaseModule } from "src/firebase/firebase.module";
import { Post } from "src/posts/entities/post.entity";
import { Vote } from "src/votes/entities/vote.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Reply } from "src/replies/entities/reply.entity";

@Module({
  imports: [
    forwardRef(() => AuthModule),
    FirebaseModule,
    TypeOrmModule.forFeature([User, Post, Vote, Comment, Reply]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
