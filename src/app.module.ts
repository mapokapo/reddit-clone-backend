import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users/entities/user.entity";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./exceptions-filters/all-exceptions-filter";
import { CommunitiesModule } from "./communities/communities.module";
import { Community } from "./communities/entities/community.entity";
import { PostsModule } from "./posts/posts.module";
import { Post } from "./posts/entities/post.entity";
import { Vote } from "./votes/vote.entity";
import { FirebaseModule } from "./firebase/firebase.module";
import { AppService } from "./app.service";
import { SeederModule } from "./seeder/seeder.module";
import { CommentsModule } from "./comments/comments.module";
import { Comment } from "./comments/entities/comment.entity";
import { RepliesModule } from "./replies/replies.module";
import { Reply } from "./replies/entities/reply.entity";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    AuthModule,
    CommentsModule,
    CommunitiesModule,
    ConfigModule.forRoot(),
    FirebaseModule,
    PostsModule,
    RepliesModule,
    SeederModule,
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "./sqlite.db",
      entities: [Comment, Community, Post, Reply, User, Vote],
      synchronize: true,
    }),
    UsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    AppService,
  ],
})
export class AppModule {}
