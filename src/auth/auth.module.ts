import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UsersModule } from "src/users/users.module";
import { SessionsModule } from "src/sessions/sessions.module";
import { LocalStrategy } from "./strategies/local.strategy";
import { LocalAuthGuard } from "./guards/local.guard";
import { GoogleStrategy } from "./strategies/google.strategy";
import { GoogleAuthGuard } from "./guards/google.guard";
import { OAuthModule } from "src/oauth/oauth.module";
import { AuthGuard } from "./guards/auth.guard";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule, OAuthModule, SessionsModule, UsersModule],
  controllers: [AuthController],
  providers: [
    AuthGuard,
    GoogleAuthGuard,
    GoogleStrategy,
    LocalAuthGuard,
    LocalStrategy,
  ],
  exports: [AuthGuard],
})
export class AuthModule {}
