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
import { In, Not, Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Community } from "src/communities/entities/community.entity";
import { Vote } from "src/votes/vote.entity";
import {
  FilterOptionsQuery,
  SortBy,
  Timespan,
} from "./transport/filter-options.query";

type ForEntity =
  | {
      user: User;
    }
  | {
      community: Community;
    }
  | {
      communities: Community[];
    };

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

  private async getPosts(
    predicate: ForEntity,
    filterOptions: FilterOptionsQuery
  ) {
    const { sortBy, timespan, take, skip } = filterOptions;

    let cutoffDate: Date;
    const now = new Date();
    switch (timespan) {
      case Timespan.Day:
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case Timespan.Week:
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case Timespan.Month:
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case Timespan.Year:
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case Timespan.AllTime:
      default:
        cutoffDate = new Date(0); // No limit
        break;
    }

    const queryBuilder = this.postsRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.votes", "vote")
      .leftJoinAndSelect("vote.voter", "voter")
      .leftJoinAndSelect("post.community", "community")
      .leftJoinAndSelect("post.author", "author");

    if ("user" in predicate) {
      queryBuilder.where("post.author.id = :userId", {
        userId: predicate.user.id,
      });
    } else if ("communities" in predicate) {
      queryBuilder.where("community.id IN (:...communityIds)", {
        communityIds: predicate.communities.map(c => c.id),
      });
    } else {
      queryBuilder.where("community.id = :communityId", {
        communityId: predicate.community.id,
      });
    }

    queryBuilder.andWhere("post.createdAt > :cutoffDate", { cutoffDate });

    if (sortBy === SortBy.New) {
      queryBuilder.orderBy("post.createdAt", "DESC");
    } else {
      queryBuilder
        .addSelect(
          "SUM(CASE WHEN vote.isUpvote = 1 THEN 1 ELSE -1 END)",
          "voteValue"
        )
        .groupBy("vote.id")
        .orderBy("voteValue", "DESC");
    }

    return await queryBuilder.skip(skip).take(take).getMany();
  }

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

  async findAll(
    communityId: number,
    filterOptions: FilterOptionsQuery
  ): Promise<Post[]> {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
    });

    if (community === null) {
      throw new NotFoundException("Community not found");
    }

    return await this.getPosts(
      {
        community: community,
      },
      filterOptions
    );
  }

  async findAllByUser(
    userId: number,
    filterOptions: FilterOptionsQuery
  ): Promise<Post[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user === null) {
      throw new NotFoundException("User not found");
    }

    return await this.getPosts(
      {
        user: user,
      },
      filterOptions
    );
  }

  async getFeed(
    user: User,
    filterOptions: FilterOptionsQuery
  ): Promise<Post[]> {
    const posts = await this.getPosts(
      {
        user,
      },
      filterOptions
    );

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
          newestCommunities.map(
            async community =>
              await this.postsRepository.find({
                where: {
                  community: {
                    id: community.id,
                  },
                  id: Not(In(posts.map(post => post.id))),
                },
                order: {
                  createdAt: "DESC",
                },
                take: 1,
              })
          )
        )
      ).flat();

      if (filterOptions.sortBy === SortBy.Top) {
        newestPosts.sort(
          (a, b) =>
            b.votes.filter(vote => vote.isUpvote).length -
            b.votes.filter(vote => !vote.isUpvote).length -
            (a.votes.filter(vote => vote.isUpvote).length -
              a.votes.filter(vote => !vote.isUpvote).length)
        );
      }

      posts.push(...newestPosts);
    }
    return posts;
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
      throw new BadRequestException(
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
}
