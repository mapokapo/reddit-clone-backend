import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { AuthModule } from "src/auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { Community } from "src/communities/entities/community.entity";
import { Vote } from "src/votes/vote.entity";
import { FirebaseModule } from "src/firebase/firebase.module";
import { UsersModule } from "src/users/users.module";
import { User } from "src/users/entities/user.entity";

@Module({
  imports: [
    AuthModule,
    FirebaseModule,
    TypeOrmModule.forFeature([Post, Community, Vote, User]),
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
