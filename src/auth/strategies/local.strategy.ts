import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async validate(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(email);

    if (user === null) {
      throw new UnauthorizedException();
    }

    if (user.passwordHash === undefined) {
      throw new UnauthorizedException();
    }

    const passwordMatches = await this.usersService.comparePasswords(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
