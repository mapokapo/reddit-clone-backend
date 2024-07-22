import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePostDto } from "./dtos/create-post.dto";
import { UpdatePostDto } from "./dtos/update-post.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Community } from "src/communities/entities/community.entity";
import { Vote } from "src/votes/vote.entity";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
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
    post.votes = [];

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

  async findAllByUser(userId: number): Promise<Post[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user === null) {
      throw new NotFoundException("User not found");
    }

    return await this.postsRepository.find({
      where: { author: user },
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

  async vote(
    user: User,
    communityId: number,
    id: number,
    isUpvote: boolean
  ): Promise<void> {
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
      relations: {
        author: true,
        votes: {
          voter: true,
        },
      },
    });

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    if (post.author.id === user.id) {
      throw new NotFoundException("You cannot vote on your own post");
    }

    const userAlreadyVoted = post.votes.some(vote => vote.voter.id === user.id);
    const userAlreadyDidSameVote = post.votes.some(
      vote => vote.voter.id === user.id && vote.isUpvote === isUpvote
    );

    if (userAlreadyDidSameVote) {
      throw new NotFoundException(
        `You cannot ${isUpvote ? "upvote" : "downvote"} more than once`
      );
    }

    if (userAlreadyVoted) {
      // change the user's vote
      const vote = post.votes.find(vote => vote.voter.id === user.id);

      if (vote === undefined) {
        throw new NotFoundException("Vote not found");
      }

      vote.isUpvote = isUpvote;
    } else {
      const vote = new Vote();
      vote.post = post;
      vote.voter = user;
      vote.isUpvote = isUpvote;

      post.votes.push(vote);
    }

    await this.postsRepository.save(post);
  }

  async unvote(user: User, communityId: number, id: number): Promise<void> {
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
      relations: {
        votes: {
          voter: true,
        },
      },
    });

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    const vote = post.votes.find(vote => vote.voter.id === user.id);

    if (vote === undefined) {
      throw new NotFoundException("You have not voted on this post");
    }

    const voteToRemove = post.votes.find(vote => vote.voter.id === user.id);

    if (voteToRemove === undefined) {
      throw new NotFoundException("Vote not found");
    }

    await this.votesRepository.remove(voteToRemove);

    post.votes = post.votes.filter(vote => vote.voter.id !== user.id);

    await this.postsRepository.save(post);
  }

  async getFeed(user: User): Promise<Post[]> {
    const posts = await Promise.all(
      user.communities.map(community =>
        this.postsRepository.find({
          where: { community: community },
          take: 10,
        })
      )
    );

    return posts.flat();
  }
}
