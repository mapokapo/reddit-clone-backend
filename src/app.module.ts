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

@Module({
  imports: [
    AuthModule,
    CommunitiesModule,
    SessionsModule,
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "./sqlite.db",
      entities: [Community, Session, User],
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
