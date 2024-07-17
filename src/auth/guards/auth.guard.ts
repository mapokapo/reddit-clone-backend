import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { SessionsService } from "src/sessions/sessions.service";
import { AuthenticatedRequest } from "../authenticated-request";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionsService: SessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.cookies["SESSION_TOKEN"] as string | undefined;

    if (!token) {
      throw new UnauthorizedException();
    }

    const session = await this.sessionsService.findOneByToken(token);

    if (!session) {
      throw new UnauthorizedException();
    }

    const user = session.user;

    request.user = user;

    return true;
  }
}
