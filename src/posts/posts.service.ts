import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
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
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    if (
      community.isPrivate &&
      !user.communities.find(userCommunity => userCommunity.id === community.id)
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    const post = new Post();
    post.title = createPostDto.title;
    post.content = createPostDto.content;
    post.community = community;
    post.author = user;
    post.comments = [];
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
      where: {
        community: {
          id: communityId,
        },
      },
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
      where: {
        author: {
          id: userId,
        },
      },
    });
  }

  async findOne(id: number): Promise<Post | null> {
    const post = await this.postsRepository.findOne({
      where: { id: id },
    });

    return post;
  }

  async update(
    user: User,
    id: number,
    updatePostDto: UpdatePostDto
  ): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id: id },
      relations: ["author", "community"],
    });

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    if (
      post.community.isPrivate &&
      !user.communities.find(community => community.id === post.community.id)
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    if (post.author.id !== user.id) {
      throw new UnauthorizedException("You are not the author of this post");
    }

    post.title = updatePostDto.title ?? post.title;
    post.content = updatePostDto.content ?? post.content;

    return await this.postsRepository.save(post);
  }

  async remove(user: User, id: number): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { id: id },
      relations: ["author", "community"],
    });

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    if (
      post.community.isPrivate &&
      !user.communities.find(community => community.id === post.community.id)
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    if (post.author.id !== user.id) {
      throw new UnauthorizedException("You are not the author of this post");
    }

    await this.postsRepository.remove(post);
  }

  async vote(user: User, id: number, isUpvote: boolean): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { id: id },
      relations: {
        author: true,
        votes: {
          voter: true,
        },
        community: true,
      },
    });

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    if (
      post.community.isPrivate &&
      !user.communities.find(community => community.id === post.community.id)
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    if (post.author.id === user.id) {
      throw new UnauthorizedException("You cannot vote on your own post");
    }

    const existingUserVote = post.votes.find(vote => vote.voter.id === user.id);
    const userAlreadyDidSameVote = post.votes.some(
      vote => vote.voter.id === user.id && vote.isUpvote === isUpvote
    );

    if (userAlreadyDidSameVote) {
      throw new NotFoundException(
        `You cannot ${isUpvote ? "upvote" : "downvote"} more than once`
      );
    }

    if (existingUserVote !== undefined) {
      existingUserVote.isUpvote = isUpvote;
    } else {
      const vote = new Vote();
      vote.post = post;
      vote.voter = user;
      vote.isUpvote = isUpvote;

      post.votes.push(vote);
    }

    await this.postsRepository.save(post);
  }

  async unvote(user: User, id: number): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { id: id },
      relations: {
        votes: {
          voter: true,
        },
        community: true,
      },
    });

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    if (
      post.community.isPrivate &&
      !user.communities.find(community => community.id === post.community.id)
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    const vote = post.votes.find(vote => vote.voter.id === user.id);

    if (vote === undefined) {
      throw new BadRequestException("You have not voted on this post");
    }

    await this.votesRepository.remove(vote);

    post.votes = post.votes.filter(vote => vote.voter.id !== user.id);

    await this.postsRepository.save(post);
  }

  async getFeed(user: User): Promise<Post[]> {
    const posts = (
      await Promise.all(
        user.communities.map(community =>
          this.postsRepository.find({
            where: {
              community: {
                id: community.id,
              },
            },
            take: 10,
          })
        )
      )
    ).flat();

    if (posts.length < 10) {
      const newestCommunities = await this.communityRepository.find({
        order: {
          createdAt: "DESC",
        },
        take: 10 - posts.length,
        where: {
          isPrivate: false,
        },
      });

      const newestPosts = (
        await Promise.all(
          newestCommunities.map(community =>
            this.postsRepository.find({
              where: {
                community: {
                  id: community.id,
                },
              },
              take: 1,
            })
          )
        )
      ).flat();

      posts.push(...newestPosts);
    }
    return posts;
  }
}
