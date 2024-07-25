import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateReplyDto } from "./create-reply.dto";

export class UpdateReplyDto extends PartialType(
  OmitType(CreateReplyDto, ["commentId"])
) {}
