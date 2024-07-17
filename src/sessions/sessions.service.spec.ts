import { Test, TestingModule } from "@nestjs/testing";
import { SessionsService } from "./sessions.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Session } from "./entities/session.entity";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import * as bcrypt from "bcrypt";
import { Response } from "express";

describe("SessionsService", () => {
  let service: SessionsService;
  let mockSessionRepository: Partial<Repository<Session>>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockSessionRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockResponse = {
      cookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOneByToken", () => {
    it("should return a session for a given token", async () => {
      const token = "testToken";
      const expectedSession = new Session();
      jest
        .spyOn(mockSessionRepository, "findOne")
        .mockResolvedValue(expectedSession);

      const result = await service.findOneByToken(token);
      expect(result).toEqual(expectedSession);
      expect(mockSessionRepository.findOne).toHaveBeenCalledWith({
        where: { token },
        relations: ["user"],
      });
    });
  });

  describe("findOneById", () => {
    it("should return a session for a given id", async () => {
      const id = 1;
      const expectedSession = new Session();
      jest
        .spyOn(mockSessionRepository, "findOne")
        .mockResolvedValue(expectedSession);

      const result = await service.findOneById(id);
      expect(result).toEqual(expectedSession);
      expect(mockSessionRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ["user"],
      });
    });
  });

  describe("create", () => {
    it("should create a new session for a user", async () => {
      const user = new User();
      user.id = 1;
      const session = new Session();
      session.user = user;
      jest.spyOn(mockSessionRepository, "save").mockResolvedValue(session);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedToken" as never);

      const result = await service.create(user);
      expect(result).toEqual(session);
      expect(mockSessionRepository.save).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete a session", async () => {
      const session = new Session();
      session.id = 1;
      jest
        .spyOn(mockSessionRepository, "delete")
        .mockResolvedValue(undefined as never);

      await service.delete(session);
      expect(mockSessionRepository.delete).toHaveBeenCalledWith(session.id);
    });
  });

  describe("createAndSetSessionCookie", () => {
    it("should create a session and set a cookie", async () => {
      const user = new User();
      const session = new Session();
      session.token = "sessionToken";
      session.expiresAt = new Date();
      jest.spyOn(service, "create").mockResolvedValue(session);

      await service.createAndSetSessionCookie(mockResponse as Response, user);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(user);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "SESSION_TOKEN",
        session.token,
        {
          httpOnly: true,
          expires: session.expiresAt,
        }
      );
    });
  });
});
