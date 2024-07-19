import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthenticatedRequest } from "./authenticated-request";

/**
 * ## Description
 *
 * A decorator that extracts the decoded OAuth ID token from a request authenticated with Firebase Authentication using the `@UseAuth()` decorator.
 *
 * ---
 *
 * ## (!) Note
 *
 * This decorator requires the usage of the `@UseAuth()` decorator, either with the **no-profile** or **profile** auth modes. Otherwise, this decorator will throw an `UnauthorizedException`.
 *
 * @returns The user from the request.
 * @throws UnauthorizedException If the OAuth ID token is not found in the request.
 */
export const ReqIdToken = createParamDecorator(
  (_: never, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Partial<AuthenticatedRequest>>();

    if (request.decodedIdToken === undefined) {
      throw new UnauthorizedException();
    }

    return request.decodedIdToken;
  }
);
