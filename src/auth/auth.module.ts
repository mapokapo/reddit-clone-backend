import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UsersModule } from "src/users/users.module";
import { SessionsModule } from "src/sessions/sessions.module";

@Module({
  imports: [UsersModule, SessionsModule],
  controllers: [AuthController],
})
export class AuthModule {}
