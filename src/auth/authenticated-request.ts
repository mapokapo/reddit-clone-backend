import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { User } from "src/users/entities/user.entity";

export interface AuthenticatedRequest extends Request {
  decodedIdToken: DecodedIdToken;
  user: User;
}
