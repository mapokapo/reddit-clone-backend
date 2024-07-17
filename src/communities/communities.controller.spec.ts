import { Test, TestingModule } from "@nestjs/testing";
import { CommunitiesController } from "./communities.controller";
import { CommunitiesService } from "./communities.service";
import { CreateCommunityRequest } from "./transport/create-community.request";
import { Community } from "./entities/community.entity";
import { NotFoundException } from "@nestjs/common";
import { AuthenticatedRequest } from "src/auth/authenticated-request";
import { AuthGuard } from "src/auth/guards/auth.guard";

jest.mock("./communities.service");

describe("CommunitiesController", () => {
  let controller: CommunitiesController;
  let service: CommunitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunitiesController],
      providers: [
        {
          provide: CommunitiesService,
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

    controller = module.get<CommunitiesController>(CommunitiesController);
    service = module.get<CommunitiesService>(CommunitiesService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new community", async () => {
      const req = { user: { id: 1 } } as AuthenticatedRequest;
      const createCommunityRequest = new CreateCommunityRequest();
      createCommunityRequest.name = "Test Community";
      createCommunityRequest.description = "A test community";

      const expectedCommunity = new Community();
      expectedCommunity.id = 1;
      expectedCommunity.name = "Test Community";
      expectedCommunity.description = "A test community";

      jest.spyOn(service, "create").mockResolvedValue(expectedCommunity);

      expect(await controller.create(req, createCommunityRequest)).toEqual(
        expectedCommunity
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(req.user, expect.anything());
    });
  });

  describe("findAll", () => {
    it("should return an array of communities", async () => {
      const expectedCommunities = [new Community(), new Community()];

      jest.spyOn(service, "findAll").mockResolvedValue(expectedCommunities);

      expect(await controller.findAll()).toEqual(expectedCommunities);
    });
  });

  describe("findOne", () => {
    it("should return a community by ID", async () => {
      const expectedCommunity = new Community();
      expectedCommunity.id = 1;

      jest.spyOn(service, "findOne").mockResolvedValue(expectedCommunity);

      expect(await controller.findOne(1)).toEqual(expectedCommunity);
    });

    it("should throw NotFoundException if community is not found", async () => {
      jest.spyOn(service, "findOne").mockResolvedValue(null);

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
