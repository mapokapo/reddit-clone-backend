import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { AuthModule } from "src/auth/auth.module";
import { SessionsModule } from "src/sessions/sessions.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { Community } from "src/communities/entities/community.entity";

@Module({
  imports: [
    AuthModule,
    SessionsModule,
    TypeOrmModule.forFeature([Post, Community]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
