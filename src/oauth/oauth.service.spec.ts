import { Test, TestingModule } from "@nestjs/testing";
import { OAuthService } from "./oauth.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { OAuthAccount } from "./entities/oauth-account.entity";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";

describe("OAuthService", () => {
  let service: OAuthService;
  let mockOAuthAccountRepository: Partial<Repository<OAuthAccount>>;

  beforeEach(async () => {
    mockOAuthAccountRepository = {
      findOne: jest.fn(),
      insert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: getRepositoryToken(OAuthAccount),
          useValue: mockOAuthAccountRepository,
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOne", () => {
    it("should return an OAuthAccount for a given user and provider", async () => {
      const user = new User();
      const provider = "testProvider";
      const expectedOAuthAccount = new OAuthAccount();

      jest
        .spyOn(mockOAuthAccountRepository, "findOne")
        .mockResolvedValue(expectedOAuthAccount);

      const result = await service.findOne(user, provider);
      expect(result).toEqual(expectedOAuthAccount);
      expect(mockOAuthAccountRepository.findOne).toHaveBeenCalledWith({
        where: {
          user,
          provider,
        },
      });
    });
  });

  describe("create", () => {
    it("should successfully insert a new OAuthAccount", async () => {
      const user = new User();
      const provider = "testProvider";
      const providerId = "testProviderId";

      jest
        .spyOn(mockOAuthAccountRepository, "insert")
        .mockResolvedValue(undefined as never);

      await service.create(user, provider, providerId);
      expect(mockOAuthAccountRepository.insert).toHaveBeenCalledWith({
        user,
        provider,
        providerId,
      });
    });
  });
});
