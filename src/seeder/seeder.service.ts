import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Community } from "src/communities/entities/community.entity";
import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";
import { Vote } from "src/votes/vote.entity";
import { Repository } from "typeorm";
import { faker } from "@faker-js/faker";

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
    private readonly voteRepository: Repository<Vote>
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
    community.members = members.includes(owner) ? members : [...members, owner];
    community.posts = [];

    owner.ownedCommunities.push(community);
    members.forEach(member => member.communities.push(community));

    return community;
  }

  /**
   * generate some communities for these users:
- each community is owned by exactly one owner
- each community can have 1 or more members, if there is only one member then it must be the owner
   */
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

  private genVote({ user, post }: { user: User; post: Post }) {
    const vote = new Vote();
    vote.voter = user;
    vote.post = post;
    vote.isUpvote = faker.datatype.boolean();

    user.votes.push(vote);
    post.votes.push(vote);

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
      const post = faker.helpers.arrayElement(community.posts);
      const vote = this.genVote({ user, post });

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
    await this.genPosts(30, users);
    await this.genVotes(40, users);

    await this.genSeedMarkerUser();
  }
}
