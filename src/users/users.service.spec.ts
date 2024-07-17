import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { UnauthorizedException } from "@nestjs/common";

describe("UsersService", () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User)
    ) as jest.Mocked<Repository<User>>;
  });

  describe("create", () => {
    it("should successfully create a new user", async () => {
      const createUserDto = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      };
      userRepository.findOne.mockResolvedValue(null); // Simulate user not found
      userRepository.save.mockImplementation(user => {
        return Promise.resolve({ ...user, id: 1 } as User);
      });

      const result = await service.create(createUserDto);

      expect(result).toEqual(
        expect.objectContaining({
          email: "test@example.com",
          name: "Test User",
        })
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          name: "Test User",
        })
      );
    });

    it("should throw an error if the user already exists", async () => {
      const createUserDto = {
        email: "existing@example.com",
        name: "Existing User",
        password: "password123",
      };
      userRepository.findOne.mockResolvedValue(new User()); // Simulate user found

      await expect(service.create(createUserDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
