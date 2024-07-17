import { Module } from "@nestjs/common";
import { OAuthService } from "./oauth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OAuthAccount } from "./entities/oauth-account.entity";

@Module({
  imports: [TypeOrmModule.forFeature([OAuthAccount])],
  providers: [OAuthService],
  exports: [OAuthService],
})
export class OAuthModule {}
