import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { SessionsService } from "src/sessions/sessions.service";
import { UsersService } from "src/users/users.service";
import { LocalAuthGuard } from "./guards/local.guard";
import { Reflector } from "@nestjs/core";
import { AuthenticatedRequest } from "./authenticated-request";
import { Request, Response } from "express";

jest.mock("src/sessions/sessions.service");
jest.mock("src/users/users.service");
jest.mock("./guards/local.guard");

describe("AuthController", () => {
  let controller: AuthController;
  let sessionsService: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        SessionsService,
        UsersService,
        {
          provide: Reflector,
          useValue: {},
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    sessionsService = module.get<SessionsService>(SessionsService);
  });

  describe("login", () => {
    it("should create and set session cookie on successful login", async () => {
      const mockUser = { id: 1, name: "testUser" };
      const mockReq = { user: mockUser } as AuthenticatedRequest;
      const mockRes = { cookie: jest.fn() } as unknown as Response;

      await controller.login(mockReq, mockRes);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(sessionsService.createAndSetSessionCookie).toHaveBeenCalledWith(
        mockRes,
        mockUser
      );
    });
  });

  describe("logout", () => {
    it("should throw UnauthorizedException if no session token is provided", async () => {
      const mockReq = { cookies: {} } as unknown as Request;
      const mockRes = {} as unknown as Response;

      await expect(controller.logout(mockReq, mockRes)).rejects.toThrow();
    });
  });
});
