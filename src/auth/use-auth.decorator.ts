import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ErrorResponse } from "src/exceptions-filters/transport/error.response";

export type AuthMode = "no-profile" | "profile";

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
 *
 * The **no-profile** auth mode is useful for routes that create a new user profile in the DB, since by definition the user profile does not exist yet in that case and needs to be created.
 *
 * @param authMode The auth mode to use.
 * @returns A decorator.
 */
export function UseAuth(authMode: AuthMode = "profile") {
  return applyDecorators(
    SetMetadata("authMode", authMode),
    UseGuards(AuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: "Unauthorized",
      type: ErrorResponse,
    })
  );
}
