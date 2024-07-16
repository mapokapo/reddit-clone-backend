import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateCommunityDto } from "./dtos/create-community.dto";
import { UpdateCommunityDto } from "./dtos/update-community.dto";
import { User } from "src/users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Community } from "./entities/community.entity";
import { Repository } from "typeorm";

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>
  ) {}

  async create(
    user: User,
    createCommunityDto: CreateCommunityDto
  ): Promise<Community> {
    const community = new Community();
    community.name = createCommunityDto.name;
    community.description = createCommunityDto.description;
    community.owner = user;
    community.createdAt = new Date();

    return await this.communityRepository.save(community);
  }

  async findAll(): Promise<Community[]> {
    return await this.communityRepository.find();
  }

  async findOne(id: number): Promise<Community | null> {
    return await this.communityRepository.findOneBy({
      id,
    });
  }

  async update(
    user: User,
    id: number,
    updateCommunityDto: UpdateCommunityDto
  ): Promise<Community> {
    const community = await this.communityRepository.findOneBy({
      id,
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    if (community.owner.id !== user.id) {
      throw new UnauthorizedException(
        "You are not the owner of this community"
      );
    }

    community.name = updateCommunityDto.name ?? community.name;
    community.description =
      updateCommunityDto.description ?? community.description;

    return await this.communityRepository.save(community);
  }

  async remove(user: User, id: number): Promise<void> {
    const community = await this.communityRepository.findOneBy({
      id,
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    if (community.owner.id !== user.id) {
      throw new UnauthorizedException(
        "You are not the owner of this community"
      );
    }

    await this.communityRepository.remove(community);
  }
}
