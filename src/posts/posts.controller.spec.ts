import { Test, TestingModule } from "@nestjs/testing";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { CreatePostRequest } from "./transport/create-post.request";
import { Post as PostEntity } from "./entities/post.entity";
import { User } from "src/users/entities/user.entity";
import { AuthenticatedRequest } from "src/auth/authenticated-request";

describe("PostsController", () => {
  let controller: PostsController;
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should create a post", async () => {
    const req = { user: { id: 1 } as User } as AuthenticatedRequest;
    const communityId = 1;
    const createPostRequest: CreatePostRequest = {
      title: "Test Title",
      content: "Test Content",
    };
    const result: PostEntity = new PostEntity();

    jest.spyOn(service, "create").mockResolvedValue(result);

    expect(await controller.create(req, communityId, createPostRequest)).toBe(
      result
    );
  });

  it("should find all posts in a community", async () => {
    const communityId = 1;
    const result: PostEntity[] = [];

    jest.spyOn(service, "findAll").mockResolvedValue(result);

    expect(await controller.findAll(communityId)).toBe(result);
  });

  it("should find a post by ID in a community", async () => {
    const communityId = 1;
    const id = 1;
    const result: PostEntity = new PostEntity();

    jest.spyOn(service, "findOne").mockResolvedValue(result);

    expect(await controller.findOne(communityId, id)).toBe(result);
  });
});
