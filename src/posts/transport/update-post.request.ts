import { PartialType } from "@nestjs/swagger";
import { CreatePostRequest } from "./create-post.request";

export class UpdatePostRequest extends PartialType(CreatePostRequest) {}
