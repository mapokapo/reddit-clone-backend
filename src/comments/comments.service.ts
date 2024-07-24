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
import { IsNull, Repository, TreeRepository } from "typeorm";
import { Post } from "src/posts/entities/post.entity";
import { Vote } from "src/votes/vote.entity";

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

  async create(
    user: User,
    createCommentDto: CreateCommentDto
  ): Promise<Comment> {
    const post = await this.postRepository.findOne({
      where: {
        id: createCommentDto.postId,
      },
      relations: ["community"],
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

    const parent =
      createCommentDto.parentId !== null
        ? await this.commentRepository.findOne({
            where: {
              id: createCommentDto.parentId,
            },
          })
        : null;

    if (createCommentDto.parentId !== null && parent === null) {
      throw new NotFoundException("Parent comment not found");
    }

    if (parent !== null && parent.post.id !== post.id) {
      throw new BadRequestException(
        "Parent comment does not belong to this post"
      );
    }

    const comment = new Comment();
    comment.content = createCommentDto.content;
    comment.author = user;
    comment.post = post;
    comment.parent = parent ?? undefined;
    comment.children = [];
    comment.votes = [];

    return await this.commentRepository.save(comment);
  }

  async findAll(postId: number, depth: number): Promise<Comment[]> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (post === null) {
      throw new NotFoundException("Post not found");
    }

    const comments: Comment[] = [];

    const rootComments = await this.commentRepository.find({
      where: {
        post: {
          id: postId,
        },
        parent: IsNull(),
      },
    });

    for (const rootComment of rootComments) {
      const child = await this.commentRepository.findDescendantsTree(
        rootComment,
        {
          depth: depth,
          relations: ["author", "post", "votes"],
        }
      );
      comments.push(child);
    }

    return comments;
  }

  async findOne(id: number, depth: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: {
        id,
      },
    });

    if (comment === null) {
      throw new NotFoundException("Comment not found");
    }

    const deepComment = await this.commentRepository.findDescendantsTree(
      comment,
      {
        depth: depth,
        relations: ["author", "post", "votes"],
      }
    );

    return deepComment;
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

    const userAlreadyVoted = comment.votes.some(
      vote => vote.voter.id === user.id
    );
    const userAlreadyDidSameVote = comment.votes.some(
      vote => vote.voter.id === user.id && vote.isUpvote === isUpvote
    );

    if (userAlreadyDidSameVote) {
      throw new NotFoundException(
        `You cannot ${isUpvote ? "upvote" : "downvote"} more than once`
      );
    }

    if (userAlreadyVoted) {
      // change the user's vote
      const vote = comment.votes.find(vote => vote.voter.id === user.id);

      if (vote === undefined) {
        throw new NotFoundException("Vote not found");
      }

      vote.isUpvote = isUpvote;
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
