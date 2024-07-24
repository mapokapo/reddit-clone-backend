import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Community } from "src/communities/entities/community.entity";
import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";
import { Vote } from "src/votes/vote.entity";
import { Repository } from "typeorm";
import { faker } from "@faker-js/faker";
import { Comment } from "src/comments/entities/comment.entity";

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
    private readonly commentRepository: Repository<Comment>
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

  private async genPosts(count: number, users: User[]) {
    const posts = Array.from({ length: count }, () => {
      const author = faker.helpers.arrayElement(
        users.filter(user => user.communities.length > 0)
      );
      const community = faker.helpers.arrayElement(author.communities);
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
    parent,
  }: {
    author: User;
    post: Post;
    parent: Comment | null;
  }) {
    const comment = new Comment();
    comment.content = faker.lorem.sentence();
    comment.author = author;
    comment.children = [];
    comment.votes = [];
    comment.post = post;
    comment.parent = parent ?? undefined;

    author.comments.push(comment);
    post.comments.push(comment);

    return comment;
  }

  private async genRootComments(count: number, users: User[], posts: Post[]) {
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

  private async genChildComments(
    count: number,
    users: User[],
    rootComments: Comment[]
  ) {
    const comments = Array.from({ length: count }, () => {
      const author = faker.helpers.arrayElement(
        users.filter(user => user.communities.length > 0)
      );
      const parent = faker.helpers.arrayElement(rootComments);
      const post = parent.post;
      const comment = this.genComment({ author, post, parent });

      return comment;
    });

    for (const comment of comments) {
      await this.commentRepository.save(comment);
    }

    return comments;
  }

  private genVote({ user, item }: { user: User; item: Post | Comment }) {
    const vote = new Vote();
    vote.voter = user;
    if (item instanceof Post) {
      vote.post = item;
      item.votes.push(vote);
    } else {
      vote.comment = item;
      item.votes.push(vote);
    }
    vote.isUpvote = faker.datatype.boolean();

    user.votes.push(vote);

    return vote;
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
      const community = faker.helpers.arrayElement(
        user.communities.filter(community => community.posts.length > 0)
      );
      let item: Post | Comment;
      if (
        faker.datatype.boolean() &&
        community.posts.some(post => post.comments.length > 0)
      ) {
        item = faker.helpers.arrayElement(
          community.posts.flatMap(post => post.comments)
        );
      } else {
        item = faker.helpers.arrayElement(community.posts);
      }
      const vote = this.genVote({ user, item });

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
    const users = await this.genUsers(50);
    await this.genCommunities(10, users);
    const posts = await this.genPosts(30, users);
    const rootComments = await this.genRootComments(30, users, posts);
    const commentsLayer1 = await this.genChildComments(15, users, rootComments);
    const commentsLayer2 = await this.genChildComments(
      10,
      users,
      commentsLayer1
    );
    await this.genChildComments(5, users, commentsLayer2);
    await this.genVotes(100, users);

    await this.genSeedMarkerUser();
  }
}
