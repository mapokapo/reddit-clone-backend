import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedRequest } from "./authenticated-request";

/**
 * ## Description
 *
 * A decorator that extracts the decoded OAuth ID token from a request, if it is authenticated with Firebase Authentication using the `@UseAuth()` decorator, or `null` if the request is not authenticated.
 *
 * ---
 *
 * ## (!) Note
 *
 * This decorator requires the usage of the `@UseAuth()` decorator.
 *
 * No exceptions will be thrown if either the request is not authenticated or if a user profile is not found in the database.
 *
 * @returns The user from the request, or `null` if the request is not authenticated.
 */
export const ReqMaybeIdToken = createParamDecorator(
  (_: never, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Partial<AuthenticatedRequest>>();

    if (request.decodedIdToken === undefined) {
      return null;
    }

    return request.decodedIdToken;
  }
);
