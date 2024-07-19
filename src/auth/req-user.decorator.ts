import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthenticatedRequest } from "./authenticated-request";

/**
 * ## Description
 *
 * A decorator that extracts the user from a request authenticated with Firebase Authentication using the `@UseAuth()` decorator.
 *
 * ---
 *
 * ## (!) Note
 *
 * This decorator requires the usage of the `@UseAuth()` decorator.
 *
 * Additionally, this decorator can only be used if the auth mode specified in the `@UseAuth()` decorator is **profile**. Otherwise, this decorator will throw an `UnauthorizedException`.
 *
 * @returns The user from the request.
 * @throws UnauthorizedException If the user is not found in the request.
 */
export const ReqUser = createParamDecorator(
  (_: never, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Partial<AuthenticatedRequest>>();

    if (request.decodedIdToken === undefined) {
      throw new UnauthorizedException();
    }

    if (request.user === undefined) {
      throw new UnauthorizedException();
    }

    return request.user;
  }
);
