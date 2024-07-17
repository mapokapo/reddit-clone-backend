import { Test, TestingModule } from "@nestjs/testing";
import { CommunitiesService } from "./communities.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Community } from "./entities/community.entity";
import { Repository } from "typeorm";

describe("CommunitiesService", () => {
  let service: CommunitiesService;
  let mockCommunityRepository: Partial<Repository<Community>>;

  beforeEach(async () => {
    mockCommunityRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesService,
        {
          provide: getRepositoryToken(Community),
          useValue: mockCommunityRepository,
        },
      ],
    }).compile();

    service = module.get<CommunitiesService>(CommunitiesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOne", () => {
    it("should return a community by ID", async () => {
      const expectedCommunity = new Community();
      expectedCommunity.id = 1;
      jest
        .spyOn(mockCommunityRepository, "findOne")
        .mockResolvedValue(expectedCommunity);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedCommunity);
    });

    it("should return null if community is not found", async () => {
      jest.spyOn(mockCommunityRepository, "findOne").mockResolvedValue(null);

      const result = await service.findOne(1);
      expect(result).toBeNull();
    });
  });

  // Additional tests for `create`, `update`, `findAll`, `remove`, `join`, and `leave` methods should follow a similar structure.
  // Make sure to mock the repository methods and user inputs as needed for each test case.
});
