import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UsersModule } from "src/users/users.module";
import { SessionsModule } from "src/sessions/sessions.module";
import { AuthGuard } from "./auth.guard";

@Module({
  imports: [SessionsModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
