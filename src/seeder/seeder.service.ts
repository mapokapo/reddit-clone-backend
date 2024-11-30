import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Community } from "src/communities/entities/community.entity";
import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";
import { Vote } from "src/votes/entities/vote.entity";
import { Repository } from "typeorm";
import { faker } from "@faker-js/faker";
import { Comment } from "src/comments/entities/comment.entity";
import { Reply } from "src/replies/entities/reply.entity";

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>
  ) {}

  private genUser() {
    const sex = faker.person.sexType();
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName(sex);
    const email = faker.internet.email({ firstName, lastName });

    const user = new User();
    user.firebaseUid = faker.string.uuid();
    user.name = `${firstName} ${lastName}`;
    user.email = email;
    user.photoUrl = faker.helpers.maybe(() => faker.image.avatar());
    user.communities = [];
    user.posts = [];
    user.votes = [];
    user.ownedCommunities = [];
    user.comments = [];
    user.replies = [];

    return user;
  }

  private async genUsers(count: number) {
    const users = Array.from({ length: count }, () => this.genUser());

    for (const user of users) {
      await this.userRepository.save(user);
    }

    return users;
  }

  private genCommunity({
    owner,
    members = [],
  }: {
    owner: User;
    members: User[];
  }) {
    const community = new Community();
    community.name = faker.lorem.words(2);
    community.description = faker.lorem.sentence();
    community.owner = owner;
    community.isPrivate = faker.datatype.boolean({
      probability: 0.2,
    });
    community.members = members.includes(owner) ? members : [...members, owner];
    community.posts = [];

    owner.ownedCommunities.push(community);
    members.forEach(member => member.communities.push(community));

    return community;
  }

  private async genCommunities(count: number, users: User[]) {
    const communities = Array.from({ length: count }, () => {
      const owner = faker.helpers.arrayElement(users);
      const members = faker.helpers
        .shuffle(users)
        .slice(0, Math.floor(users.length / 2));
      const community = this.genCommunity({
        owner,
        members,
      });

      return community;
    });

    for (const community of communities) {
      await this.communityRepository.save(community);
    }

    return communities;
  }

  private genPost({
    author,
    community,
  }: {
    author: User;
    community: Community;
  }) {
    const post = new Post();
    post.title = faker.lorem.words(5);
    post.content = faker.lorem.paragraphs(3);
    post.author = author;
    post.community = community;
    post.votes = [];
    post.comments = [];

    author.posts.push(post);
    community.posts.push(post);

    return post;
  }

  private async genPosts(
    count: number,
    users: User[],
    communities: Community[]
  ) {
    const posts = Array.from({ length: count }, () => {
      const author = faker.helpers.arrayElement(
        users.filter(user => user.communities.length > 0)
      );
      const community = faker.helpers.arrayElement(communities);
      const post = this.genPost({
        author,
        community,
      });

      return post;
    });

    for (const post of posts) {
      await this.postRepository.save(post);
    }

    return posts;
  }

  private genComment({
    author,
    post,
  }: {
    author: User;
    post: Post;
    parent: Comment | null;
  }) {
    const comment = new Comment();
    comment.content = faker.lorem.sentence();
    comment.author = author;
    comment.votes = [];
    comment.replies = [];
    comment.post = post;

    author.comments.push(comment);
    post.comments.push(comment);

    return comment;
  }

  private async genComments(count: number, users: User[], posts: Post[]) {
    const comments = Array.from({ length: count }, () => {
      const author = faker.helpers.arrayElement(
        users.filter(user => user.communities.length > 0)
      );
      const post = faker.helpers.arrayElement(posts);
      const comment = this.genComment({ author, post, parent: null });

      return comment;
    });

    for (const comment of comments) {
      await this.commentRepository.save(comment);
    }

    return comments;
  }

  private genReply({ author, comment }: { author: User; comment: Comment }) {
    const reply = new Reply();
    reply.content = faker.lorem.sentence();
    reply.author = author;
    reply.comment = comment;
    reply.votes = [];

    author.replies.push(reply);
    comment.replies.push(reply);

    return reply;
  }

  private async genReplies(count: number, users: User[], comments: Comment[]) {
    const replies = Array.from({ length: count }, () => {
      const author = faker.helpers.arrayElement(
        users.filter(user => user.communities.length > 0)
      );
      const comment = faker.helpers.arrayElement(comments);
      const reply = this.genReply({ author, comment });

      return reply;
    });

    for (const reply of replies) {
      await this.replyRepository.save(reply);
    }

    return replies;
  }

  private genVote({
    user,
    item,
  }: {
    user: User;
    item: Post | Comment | Reply;
  }) {
    const vote = new Vote();
    vote.voter = user;
    if (item instanceof Post) {
      vote.post = item;
      item.votes.push(vote);
    } else if (item instanceof Comment) {
      vote.comment = item;
      item.votes.push(vote);
    } else {
      vote.reply = item;
      item.votes.push(vote);
    }
    vote.isUpvote = faker.datatype.boolean();

    user.votes.push(vote);

    return vote;
  }

  private genPostVote({ user }: { user: User }) {
    const post = faker.helpers.arrayElement(
      user.communities
        .map(community => community.posts)
        .reduce((acc, val) => acc.concat(val), [])
    );

    return this.genVote({ user, item: post });
  }

  private genCommentVote({ user }: { user: User }) {
    const comment = faker.helpers.arrayElement(
      user.communities
        .map(community => community.posts)
        .reduce((acc, val) => acc.concat(val), [])
        .map(post => post.comments)
        .reduce((acc, val) => acc.concat(val), [])
    );

    return this.genVote({ user, item: comment });
  }

  private genReplyVote({ user }: { user: User }) {
    const reply = faker.helpers.arrayElement(
      user.communities
        .map(community => community.posts)
        .reduce((acc, val) => acc.concat(val), [])
        .map(post => post.comments)
        .reduce((acc, val) => acc.concat(val), [])
        .map(comment => comment.replies)
        .reduce((acc, val) => acc.concat(val), [])
    );

    return this.genVote({ user, item: reply });
  }

  private async genVotes(count: number, users: User[]) {
    const votes = Array.from({ length: count }, () => {
      const user = faker.helpers.arrayElement(
        users.filter(
          user =>
            user.communities.length > 0 &&
            user.communities.some(community => community.posts.length > 0)
        )
      );
      const chosen = faker.number.int({ min: 0, max: 2 });
      let vote: Vote;

      if (chosen === 0) {
        vote = this.genPostVote({ user });
      } else if (chosen === 1) {
        vote = this.genCommentVote({ user });
      } else {
        vote = this.genReplyVote({ user });
      }

      return vote;
    });

    for (const vote of votes) {
      await this.voteRepository.save(vote);
    }

    return votes;
  }

  private async genSeedMarkerUser() {
    const user = new User();
    user.firebaseUid = "seed-marker";
    user.name = "Seed Marker";
    user.email = "seed.marker@email.com";

    await this.userRepository.save(user);
  }

  async shouldSeed() {
    return (
      (await this.userRepository.findOne({
        where: {
          firebaseUid: "seed-marker",
        },
      })) === null
    );
  }

  async seed() {
    const users = await this.genUsers(100);
    const communities = await this.genCommunities(30, users);
    const posts = await this.genPosts(70, users, communities);
    const comments = await this.genComments(150, users, posts);
    await this.genReplies(100, users, comments);
    await this.genVotes(300, users);
    await this.genSeedMarkerUser();
  }
}
