import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthenticatedRequest } from "./authenticated-request";

/**
 * ## Description
 *
 * A decorator that extracts the user from a request, if it is authenticated with Firebase Authentication using the `@UseAuth()` decorator, or `null` if the request is not authenticated.
 *
 * ---
 *
 * ## (!) Note
 *
 * This decorator requires the usage of the `@UseAuth()` decorator.
 *
 * No exceptions will be thrown if either the request is not authenticated. If the request is authenticated, but the user is not found in the request, an `UnauthorizedException` will be thrown.
 *
 * @returns The user from the request.
 * @throws UnauthorizedException If the user is not found in the request.
 */
export const ReqMaybeUser = createParamDecorator(
  (_: never, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Partial<AuthenticatedRequest>>();

    if (request.decodedIdToken === undefined) {
      return null;
    }

    if (request.user === undefined) {
      throw new UnauthorizedException();
    }

    return request.user;
  }
);
