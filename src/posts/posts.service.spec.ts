import { Test, TestingModule } from "@nestjs/testing";
import { PostsService } from "./posts.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Community } from "src/communities/entities/community.entity";
import { NotFoundException } from "@nestjs/common";
import { Vote } from "src/votes/vote.entity";

describe("PostsService", () => {
  let service: PostsService;
  let mockPostsRepository: Partial<Repository<Post>>;
  let mockCommunityRepository: Partial<Repository<Community>>;
  let mockVotesRepository: Partial<Repository<Vote>>;

  beforeEach(async () => {
    mockPostsRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockCommunityRepository = {
      findOne: jest.fn(),
    };

    mockVotesRepository = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostsRepository,
        },
        {
          provide: getRepositoryToken(Community),
          useValue: mockCommunityRepository,
        },
        {
          provide: getRepositoryToken(Vote),
          useValue: mockVotesRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should throw NotFoundException if community not found", async () => {
      const user = new User();
      const createPostDto = {
        title: "Test Post",
        content: "This is a test",
        communityId: 1,
      };

      jest.spyOn(mockCommunityRepository, "findOne").mockResolvedValue(null);

      await expect(service.create(user, createPostDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should create a post", async () => {
      const user = new User();
      user.id = 1;
      const community = new Community();
      community.id = 1;
      community.members = [user];
      const createPostDto = {
        title: "Test Post",
        content: "This is a test",
        communityId: 1,
      };
      const post = new Post();
      post.title = createPostDto.title;
      post.content = createPostDto.content;
      post.community = community;
      post.author = user;

      jest
        .spyOn(mockCommunityRepository, "findOne")
        .mockResolvedValue(community);
      jest.spyOn(mockPostsRepository, "save").mockResolvedValue(post);

      const result = await service.create(user, createPostDto);
      expect(result).toEqual(post);
      expect(mockPostsRepository.save).toHaveBeenCalledWith({
        ...post,
        votes: [],
      });
    });
  });

  describe("findAll", () => {
    it("should throw NotFoundException if community not found", async () => {
      const communityId = 1;

      jest.spyOn(mockCommunityRepository, "findOne").mockResolvedValue(null);

      await expect(service.findAll(communityId)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should return an array of posts", async () => {
      const communityId = 1;
      const community = new Community();
      community.id = communityId;
      const posts = [new Post(), new Post()];

      jest
        .spyOn(mockCommunityRepository, "findOne")
        .mockResolvedValue(community);
      jest.spyOn(mockPostsRepository, "find").mockResolvedValue(posts);

      const result = await service.findAll(communityId);
      expect(result).toEqual(posts);
      expect(mockPostsRepository.find).toHaveBeenCalledWith({
        where: { community: community },
      });
    });
  });

  describe("findOne", () => {
    it("should throw NotFoundException if community not found", async () => {
      const communityId = 1;
      const postId = 1;

      jest.spyOn(mockCommunityRepository, "findOne").mockResolvedValue(null);

      await expect(service.findOne(communityId, postId)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should return a post", async () => {
      const communityId = 1;
      const postId = 1;
      const community = new Community();
      community.id = communityId;
      const post = new Post();
      post.id = postId;
      post.community = community;

      jest
        .spyOn(mockCommunityRepository, "findOne")
        .mockResolvedValue(community);
      jest.spyOn(mockPostsRepository, "findOne").mockResolvedValue(post);

      const result = await service.findOne(communityId, postId);
      expect(result).toEqual(post);
      expect(mockPostsRepository.findOne).toHaveBeenCalledWith({
        where: { community: community, id: postId },
      });
    });
  });
});
