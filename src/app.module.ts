import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users/entities/user.entity";
import { SessionsModule } from "./sessions/sessions.module";
import { Session } from "./sessions/entities/session.entity";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./exceptions-filters/all-exceptions-filter";
import { CommunitiesModule } from "./communities/communities.module";
import { Community } from "./communities/entities/community.entity";
import { PostsModule } from "./posts/posts.module";
import { Post } from "./posts/entities/post.entity";
import { Vote } from "./votes/vote.entity";
import { OAuthModule } from "./oauth/oauth.module";
import { OAuthAccount } from "./oauth/entities/oauth-account.entity";

@Module({
  imports: [
    AuthModule,
    CommunitiesModule,
    OAuthModule,
    PostsModule,
    SessionsModule,
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "./sqlite.db",
      entities: [Community, OAuthAccount, Post, Session, User, Vote],
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
