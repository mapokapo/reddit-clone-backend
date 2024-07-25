import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { User } from "src/users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Vote } from "src/votes/vote.entity";
import { Reply } from "./entities/reply.entity";
import { CreateReplyDto } from "./dto/create-reply.dto";
import { Comment } from "src/comments/entities/comment.entity";
import { UpdateReplyDto } from "./dto/update-reply.dto";

@Injectable()
export class RepliesService {
  constructor(
    @InjectRepository(Reply)
    private readonly repliesRepository: Repository<Reply>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>
  ) {}

  async create(user: User, createReplyDto: CreateReplyDto): Promise<Reply> {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: createReplyDto.commentId,
      },
      relations: {
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

    const reply = new Reply();
    reply.content = createReplyDto.content;
    reply.author = user;
    reply.comment = comment;
    reply.votes = [];

    return await this.repliesRepository.save(reply);
  }

  async findAll(commentId: number): Promise<Reply[]> {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (comment === null) {
      throw new NotFoundException("Comment not found");
    }

    return await this.repliesRepository.find({
      where: {
        comment: {
          id: comment.id,
        },
      },
    });
  }

  async findOne(id: number): Promise<Reply | null> {
    return await this.repliesRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(
    user: User,
    id: number,
    updateReplyDto: UpdateReplyDto
  ): Promise<Reply> {
    const reply = await this.repliesRepository.findOne({
      where: {
        id,
      },
      relations: {
        author: true,
        comment: {
          post: {
            community: true,
          },
        },
      },
    });

    if (reply === null) {
      throw new NotFoundException("Reply not found");
    }

    if (reply.author.id !== user.id) {
      throw new UnauthorizedException("You are not the author of this reply");
    }

    if (
      reply.comment.post.community.isPrivate &&
      !user.communities.find(
        community => community.id === reply.comment.post.community.id
      )
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    reply.content = updateReplyDto.content ?? reply.content;

    return await this.repliesRepository.save(reply);
  }

  async remove(user: User, id: number): Promise<void> {
    const reply = await this.repliesRepository.findOne({
      where: {
        id,
      },
      relations: {
        author: true,
        comment: {
          post: {
            community: true,
          },
        },
      },
    });

    if (reply === null) {
      throw new NotFoundException("Reply not found");
    }

    if (reply.author.id !== user.id) {
      throw new UnauthorizedException("You are not the author of this reply");
    }

    if (
      reply.comment.post.community.isPrivate &&
      !user.communities.find(
        community => community.id === reply.comment.post.community.id
      )
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    await this.repliesRepository.remove(reply);
  }

  async vote(user: User, id: number, isUpvote: boolean): Promise<void> {
    const reply = await this.repliesRepository.findOne({
      where: { id: id },
      relations: {
        author: true,
        votes: {
          voter: true,
        },
        comment: {
          post: {
            community: true,
          },
        },
      },
    });

    if (reply === null) {
      throw new NotFoundException("Reply not found");
    }

    if (
      reply.comment.post.community.isPrivate &&
      !user.communities.find(
        community => community.id === reply.comment.post.community.id
      )
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    if (reply.author.id === user.id) {
      throw new UnauthorizedException("You cannot vote on your own reply");
    }

    const existingUserVote = reply.votes.find(
      vote => vote.voter.id === user.id
    );
    const userAlreadyDidSameVote = reply.votes.some(
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
      vote.reply = reply;
      vote.voter = user;
      vote.isUpvote = isUpvote;

      reply.votes.push(vote);
    }

    await this.repliesRepository.save(reply);
  }

  async unvote(user: User, id: number): Promise<void> {
    const reply = await this.repliesRepository.findOne({
      where: { id: id },
      relations: {
        votes: {
          voter: true,
        },
        comment: {
          post: {
            community: true,
          },
        },
      },
    });

    if (reply === null) {
      throw new NotFoundException("Reply not found");
    }

    if (
      reply.comment.post.community.isPrivate &&
      !user.communities.find(
        community => community.id === reply.comment.post.community.id
      )
    ) {
      throw new UnauthorizedException(
        "You are not a member of this private community"
      );
    }

    const vote = reply.votes.find(vote => vote.voter.id === user.id);

    if (vote === undefined) {
      throw new BadRequestException("You have not voted on this reply");
    }

    await this.votesRepository.remove(vote);

    reply.votes = reply.votes.filter(vote => vote.voter.id !== user.id);

    await this.repliesRepository.save(reply);
  }
}
