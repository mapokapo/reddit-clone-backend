import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { Repository } from "typeorm";
import { UserDataType } from "./dtos/user-data-type.dto";
import { Post as PostEntity } from "src/posts/entities/post.entity";
import { Vote } from "src/votes/vote.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByFirebaseUid(uid: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        firebaseUid: uid,
      },
      relations: ["communities", "ownedCommunities", "posts", "votes"],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findOneByFirebaseUid(createUserDto.firebaseUid);

    if (user !== null) {
      throw new UnauthorizedException("User already exists");
    } else {
      const newUser = new User();
      newUser.firebaseUid = createUserDto.firebaseUid;
      newUser.email = createUserDto.email;
      newUser.name = createUserDto.name;
      newUser.photoUrl = createUserDto.photoUrl ?? undefined;

      return await this.userRepository.save(newUser);
    }
  }

  async update(
    user: User,
    id: number,
    updateUserDto: UpdateUserDto
  ): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (foundUser === null) {
      throw new NotFoundException("User not found");
    }

    if (foundUser.id !== user.id) {
      throw new UnauthorizedException("You cannot update another user");
    }

    foundUser.email = updateUserDto.email ?? foundUser.email;
    foundUser.name = updateUserDto.name ?? foundUser.name;
    foundUser.photoUrl = updateUserDto.photoUrl ?? foundUser.photoUrl;

    return await this.userRepository.save(foundUser);
  }

  async remove(user: User, id: number): Promise<void> {
    const foundUser = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (foundUser === null) {
      throw new NotFoundException("User not found");
    }

    if (foundUser.id !== user.id) {
      throw new UnauthorizedException("You cannot delete another user");
    }

    await this.userRepository.delete(foundUser.id);
  }

  async getUserData(
    user: User,
    include: UserDataType[]
  ): Promise<(PostEntity | Vote)[] | null> {
    let data: (PostEntity | Vote)[] = [];

    if (include.includes(UserDataType.POSTS)) {
      const posts = await this.postRepository.find({
        where: {
          author: {
            id: user.id,
          },
        },
      });

      data = data.concat(posts);
    }

    if (include.includes(UserDataType.VOTES)) {
      const votes = await this.voteRepository.find({
        where: {
          voter: {
            id: user.id,
          },
        },
      });

      data = data.concat(votes);
    }

    return data;
  }
}
