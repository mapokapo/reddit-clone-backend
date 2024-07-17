import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {
  Strategy as GooglePassportStrategy,
  StrategyOptions,
} from "passport-google-oauth20";
import { GoogleProfile } from "../interfaces/google-profile.interface";
import { ConfigService } from "@nestjs/config";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { OAuthService } from "src/oauth/oauth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  GooglePassportStrategy,
  "google"
) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly oauthService: OAuthService
  ) {
    const options: StrategyOptions = {
      clientID: configService.getOrThrow("GOOGLE_CLIENT_ID"),
      clientSecret: configService.getOrThrow("GOOGLE_CLIENT_SECRET"),
      callbackURL: "http://localhost:5000/auth/google/callback",
      scope: ["email", "profile"],
    };

    super(options);
  }

  async validate(
    _: string,
    __: string,
    googleProfile: GoogleProfile
  ): Promise<User | null> {
    const googleEmail = googleProfile.emails[0].value;

    let user = await this.usersService.findOneByEmail(googleEmail);

    if (user === null) {
      user = await this.usersService.create({
        email: googleEmail,
        name: googleProfile.displayName,
        password: null,
      });
    }

    const googleAccount = await this.oauthService.findOne(user, "google");

    if (googleAccount === null) {
      await this.oauthService.create(user, "google", googleProfile.id);

      return user;
    } else {
      if (googleAccount.providerId !== googleProfile.id) {
        throw new UnauthorizedException(
          "Account already associated with another Google account"
        );
      }

      return user;
    }
  }
}
