import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({
      email,
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({
      id,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new User();
    newUser.email = createUserDto.email;
    newUser.username = createUserDto.username;
    newUser.passwordHash = await bcrypt.hash(createUserDto.password, 10);

    return await this.userRepository.save(newUser);
  }

  async update(
    user: User,
    id: number,
    updateUserDto: UpdateUserDto
  ): Promise<User> {
    const foundUser = await this.userRepository.findOneBy({
      id,
    });

    if (foundUser === null) {
      throw new NotFoundException("User not found");
    }

    if (foundUser.id !== user.id) {
      throw new UnauthorizedException("You cannot update another user");
    }

    foundUser.email = updateUserDto.email ?? foundUser.email;
    foundUser.username = updateUserDto.username ?? foundUser.username;

    return await this.userRepository.save(foundUser);
  }

  async remove(user: User, id: number): Promise<void> {
    const foundUser = await this.userRepository.findOneBy({
      id,
    });

    if (foundUser === null) {
      throw new NotFoundException("User not found");
    }

    if (foundUser.id !== user.id) {
      throw new UnauthorizedException("You cannot delete another user");
    }

    await this.userRepository.delete(foundUser.id);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
