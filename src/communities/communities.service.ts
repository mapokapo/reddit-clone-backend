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
    community.members = [user];
    community.posts = [];

    return await this.communityRepository.save(community);
  }

  async findAll(user: User | null): Promise<Community[]> {
    const privateCommunitiesTheUserIsAMemberOf =
      user === null
        ? []
        : await this.communityRepository.find({
            where: {
              isPrivate: true,
              members: {
                id: user.id,
              },
            },
          });

    const publicCommunities = await this.communityRepository.find({
      where: {
        isPrivate: false,
      },
    });

    return [...privateCommunitiesTheUserIsAMemberOf, ...publicCommunities];
  }

  async findUserCommunities(user: User): Promise<Community[]> {
    return await this.communityRepository.find({
      where: {
        members: {
          id: user.id,
        },
      },
    });
  }

  async findOne(user: User | null, id: number): Promise<Community | null> {
    const community = await this.communityRepository.findOne({
      where: {
        id,
      },
      relations: ["members"],
    });

    if (community?.isPrivate === true && user !== null) {
      if (community.members.some(member => member.id === user.id)) {
        return community;
      } else {
        throw new UnauthorizedException(
          "You are not a member of this community"
        );
      }
    }

    return community;
  }

  async checkUserMembership(user: User, id: number): Promise<string> {
    const community = await this.communityRepository.findOne({
      where: {
        id,
      },
      relations: ["members"],
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    return community.members.some(member => member.id === user.id)
      ? "member"
      : "non-member";
  }

  async update(
    user: User,
    id: number,
    updateCommunityDto: UpdateCommunityDto
  ): Promise<Community> {
    const community = await this.communityRepository.findOne({
      where: {
        id,
      },
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
    const community = await this.communityRepository.findOne({
      where: {
        id,
      },
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

  async join(user: User, id: number): Promise<void> {
    const community = await this.communityRepository.findOne({
      where: {
        id,
      },
      relations: ["members"],
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    if (user.communities.find(userCommunity => userCommunity.id === id)) {
      throw new UnauthorizedException(
        "You are already a member of this community"
      );
    }

    community.members.push(user);

    await this.communityRepository.save(community);
  }

  async leave(user: User, id: number): Promise<void> {
    const community = await this.communityRepository.findOne({
      where: {
        id,
      },
      relations: ["members"],
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    if (!user.communities.find(userCommunity => userCommunity.id === id)) {
      throw new UnauthorizedException("You are not a member of this community");
    }

    if (community.owner.id === user.id) {
      throw new UnauthorizedException(
        "You are the owner of this community and cannot leave"
      );
    }

    community.members = community.members.filter(
      member => member.id !== user.id
    );

    await this.communityRepository.save(community);
  }
}
