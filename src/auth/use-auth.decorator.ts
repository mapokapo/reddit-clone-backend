import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ErrorResponse } from "src/exceptions-filters/transport/error.response";

export type AuthMode = "no-profile" | "profile" | "maybe" | "maybe-no-profile";

/**
 * ## Description
 *
 * This decorator is used to protect a route with Firebase Authentication.
 *
 * It applies the following decorators:
 * - `SetMetadata("authMode", authMode)`: Sets the auth mode for the route. This metadata ise used by the AuthGuard to determine the mode of operation.
 * - `UseGuards(AuthGuard)`: Uses the AuthGuard to protect the route.
 * - `ApiBearerAuth()`: Adds the Bearer token to the Swagger documentation.
 * - `ApiUnauthorizedResponse({ description: "Unauthorized" })`: Adds the Unauthorized response to the Swagger documentation.
 *
 * ---
 *
 * ## Auth Modes
 *
 * The first argument of the decorator is the auth mode to use.
 *
 * There are currently 2 modes of operation:
 * - **no-profile**: The route is protected by Firebase Authentication, but no user profile stored in the DB is required.
 * - **profile**: The route is protected by Firebase Authentication and a user profile stored in the DB is required.
 * - **maybe**: If the request includes the proper credentials, they are verified and a user object is attached to the request. This mode requires a profile stored in the DB, which will also be attached to the request. If the request does not include the proper credentials however, the request is still allowed to pass through, but the user and profile objects in the request will be `null`.
 * - **maybe-no-profile**: If the request includes the proper credentials, they are verified and a user object is attached to the request. This mode doesn't require a profile stored in the DB. If the request does not include the proper credentials however, the request is still allowed to pass through, and the user object in the request will be `null`.
 *
 * The **no-profile** auth mode is useful for routes that create a new user profile in the DB, since by definition the user profile does not exist yet in that case and needs to be created.
 *
 * The **maybe** and **maybe-no-profile** auth modes are useful for routes that can function both with and without an authenticated user. For example, a public route that fetches a post entity which includes a `upvoted` property. The property will be true if the current user has upvoted the post, and false otherwise. If the request is not authenticated, the property will be `null`.
 *
 * @param authMode The auth mode to use.
 * @returns A decorator.
 */
export function UseAuth(authMode: AuthMode = "profile") {
  const decorators = [SetMetadata("authMode", authMode), UseGuards(AuthGuard)];

  // "maybe*" modes don't require auth
  if (!authMode.startsWith("maybe")) {
    decorators.push(ApiBearerAuth());
  }

  // "no-profile" can throw an exception if the Authorization header is invalid, and "profile" and "maybe" can throw an exception if the profile is not found, but "maybe-no-profile" can never throw an exception
  if (authMode !== "maybe-no-profile") {
    decorators.push(
      ApiUnauthorizedResponse({
        description: "Unauthorized",
        type: ErrorResponse,
      })
    );
  }

  return applyDecorators(...decorators);
}
