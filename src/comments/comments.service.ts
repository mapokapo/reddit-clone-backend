import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { User } from "src/users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { Repository, TreeRepository } from "typeorm";
import { Post } from "src/posts/entities/post.entity";
import { Vote } from "src/votes/entities/vote.entity";
import {
  FilterOptionsQuery,
  SortBy,
  Timespan,
} from "src/posts/transport/filter-options.query";

type ForEntity =
  | {
      user: User;
    }
  | {
      post: Post;
    };

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: TreeRepository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>
  ) {}

  private async getComments(
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

    const queryBuilder = this.commentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.author", "author")
      .leftJoinAndSelect("comment.post", "post")
      .leftJoinAndSelect("comment.votes", "vote")
      .leftJoinAndSelect("comment.replies", "reply")
      .leftJoinAndSelect("vote.voter", "voter");

    if ("user" in predicate) {
      queryBuilder.where("comment.author.id = :userId", {
        userId: predicate.user.id,
      });
    } else {
      queryBuilder.where("comment.post.id = :postId", {
        postId: predicate.post.id,
      });
    }

    queryBuilder.andWhere("comment.createdAt > :cutoffDate", { cutoffDate });

    if (sortBy === SortBy.New) {
      queryBuilder.orderBy("comment.createdAt", "DESC");
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

  async create(
    user: User,
    createCommentDto: CreateCommentDto
  ): Promise<Comment> {
    const post = await this.postRepository.findOne({
      where: {
        id: createCommentDto.postId,
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

    const comment = new Comment();
    comment.content = createCommentDto.content;
    comment.author = user;
    comment.post = post;
    comment.votes = [];
    comment.replies = [];

    return await this.commentRepository.save(comment);
  }

  async findAll(
    postId: number,
    filterOptions: FilterOptionsQuery
  ): Promise<Comment[]> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    return await this.getComments(
      {
        post: post,
      },
      filterOptions
    );
  }

  async findOne(id: number): Promise<Comment | null> {
    return await this.commentRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(
    user: User,
    id: number,
    updateCommentDto: UpdateCommentDto
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: {
        id,
      },
      relations: {
        author: true,
        post: {
          community: true,
        },
        replies: true,
      },
    });

    if (comment === null) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.author.id !== user.id) {
      throw new UnauthorizedException("You are not the author of this comment");
    }

    if (
      comment.post.community.isPrivate &&
      !user.communities.find(
        community => community.id === comment.post.community.id
      )
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    comment.content = updateCommentDto.content ?? comment.content;

    return await this.commentRepository.save(comment);
  }

  async remove(user: User, id: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: {
        id,
      },
      relations: {
        author: true,
        post: {
          community: true,
        },
      },
    });

    if (comment === null) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.author.id !== user.id) {
      throw new UnauthorizedException("You are not the author of this comment");
    }

    if (
      comment.post.community.isPrivate &&
      !user.communities.find(
        community => community.id === comment.post.community.id
      )
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    await this.commentRepository.remove(comment);
  }

  async vote(user: User, id: number, isUpvote: boolean): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: id },
      relations: {
        author: true,
        votes: {
          voter: true,
        },
        post: {
          community: true,
        },
      },
    });

    if (comment === null) {
      throw new NotFoundException("Comment not found");
    }

    if (
      comment.post.community.isPrivate &&
      !user.communities.find(
        community => community.id === comment.post.community.id
      )
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    if (comment.author.id === user.id) {
      throw new UnauthorizedException("You cannot vote on your own comment");
    }

    const existingUserVote = comment.votes.find(
      vote => vote.voter.id === user.id
    );
    const userAlreadyDidSameVote = comment.votes.some(
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
      vote.comment = comment;
      vote.voter = user;
      vote.isUpvote = isUpvote;

      comment.votes.push(vote);
    }

    await this.commentRepository.save(comment);
  }

  async unvote(user: User, id: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: id },
      relations: {
        votes: {
          voter: true,
        },
        post: {
          community: true,
        },
      },
    });

    if (comment === null) {
      throw new NotFoundException("Comment not found");
    }

    if (
      comment.post.community.isPrivate &&
      !user.communities.find(
        community => community.id === comment.post.community.id
      )
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    const vote = comment.votes.find(vote => vote.voter.id === user.id);

    if (vote === undefined) {
      throw new BadRequestException("You have not voted on this comment");
    }

    await this.votesRepository.remove(vote);

    comment.votes = comment.votes.filter(vote => vote.voter.id !== user.id);

    await this.commentRepository.save(comment);
  }
}
