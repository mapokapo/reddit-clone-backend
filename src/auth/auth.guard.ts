import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthenticatedRequest } from "./authenticated-request";
import { FirebaseService } from "src/firebase/firebase.service";
import { UsersService } from "src/users/users.service";
import { Reflector } from "@nestjs/core";
import { AuthMode } from "./use-auth.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authMode = this.reflector.get<AuthMode>(
      "authMode",
      context.getHandler()
    );

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorizationHeader = request.headers.authorization;
    if (authorizationHeader === undefined) {
      throw new UnauthorizedException();
    }

    const token = authorizationHeader.split(" ")[1];
    if (token === undefined) {
      throw new UnauthorizedException();
    }

    try {
      const decodedIdToken =
        await this.firebaseService.auth.verifyIdToken(token);

      request.decodedIdToken = decodedIdToken;

      if (authMode === "no-profile") {
        return true;
      }

      const user = await this.usersService.findOneByFirebaseUid(
        decodedIdToken.uid
      );

      if (user === null) {
        throw new UnauthorizedException();
      }

      request.user = user;

      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
