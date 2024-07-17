import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "./entities/session.entity";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>
  ) {}

  async findOneByToken(token: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: {
        token,
      },
      relations: ["user"],
    });
  }

  async findOneById(id: number): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: {
        id,
      },
      relations: ["user"],
    });
  }

  async create(user: User): Promise<Session> {
    const newSession = new Session();
    newSession.user = user;
    newSession.token = await bcrypt.hash(
      `${user.id.toString()}-${Date.now().toString()}`,
      10
    );
    newSession.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    return await this.sessionRepository.save(newSession);
  }

  async delete(session: Session): Promise<void> {
    await this.sessionRepository.delete(session.id);
  }
}
