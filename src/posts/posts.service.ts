import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Community } from "src/communities/entities/community.entity";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>
  ) {}

  async create(user: User, createPostDto: CreatePostDto): Promise<Post> {
    const community = await this.communityRepository.findOne({
      where: { id: createPostDto.communityId },
      relations: ["members"],
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    if (!community.members.some(member => member.id === user.id)) {
      throw new NotFoundException("You are not a member of this community");
    }

    const post = new Post();
    post.title = createPostDto.title;
    post.content = createPostDto.content;
    post.community = community;
    post.author = user;

    return await this.postsRepository.save(post);
  }

  async findAll(communityId: number): Promise<Post[]> {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    return await this.postsRepository.find({
      where: { community: community },
    });
  }

  async findOne(communityId: number, id: number): Promise<Post | null> {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    const post = await this.postsRepository.findOne({
      where: { community: community, id: id },
    });

    return post;
  }

  async update(
    user: User,
    communityId: number,
    id: number,
    updatePostDto: UpdatePostDto
  ): Promise<Post> {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ["members"],
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    if (!community.members.some(member => member.id === user.id)) {
      throw new NotFoundException("You are not a member of this community");
    }

    const post = await this.postsRepository.findOne({
      where: { community: community, id: id },
    });

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    if (post.author.id !== user.id) {
      throw new NotFoundException("You are not the author of this post");
    }

    post.title = updatePostDto.title ?? post.title;
    post.content = updatePostDto.content ?? post.content;

    return await this.postsRepository.save(post);
  }

  async remove(user: User, communityId: number, id: number): Promise<void> {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ["members"],
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    if (!community.members.some(member => member.id === user.id)) {
      throw new NotFoundException("You are not a member of this community");
    }

    const post = await this.postsRepository.findOne({
      where: { community: community, id: id },
    });

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    if (post.author.id !== user.id) {
      throw new NotFoundException("You are not the author of this post");
    }

    await this.postsRepository.remove(post);
  }
}
