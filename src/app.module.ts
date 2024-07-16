import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users/entities/user.entity";
import { SessionsModule } from "./sessions/sessions.module";
import { Session } from "./sessions/entities/session.entity";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./error-handler/error-handler";
import { AppController } from "./app.controller";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "./sqlite.db",
      entities: [User, Session],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    SessionsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
