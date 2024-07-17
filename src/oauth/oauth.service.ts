import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { OAuthAccount } from "./entities/oauth-account.entity";

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(OAuthAccount)
    private readonly oauthAccountRepository: Repository<OAuthAccount>
  ) {}

  async findOne(user: User, provider: string): Promise<OAuthAccount | null> {
    return this.oauthAccountRepository.findOne({
      where: {
        user,
        provider,
      },
    });
  }

  async create(
    user: User,
    provider: string,
    providerId: string
  ): Promise<void> {
    await this.oauthAccountRepository.insert({
      user,
      provider,
      providerId,
    });
  }
}
