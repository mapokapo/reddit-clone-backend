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

@Module({
  imports: [
    AuthModule,
    CommunitiesModule,
    FirebaseModule,
    PostsModule,
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "./sqlite.db",
      entities: [Community, Post, User, Vote],
      synchronize: true,
    }),
    UsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
