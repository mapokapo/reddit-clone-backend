import { PartialType } from "@nestjs/swagger";
import { CreateCommunityRequest } from "./create-community.request";

export class UpdateCommunityRequest extends PartialType(
  CreateCommunityRequest
) {}
