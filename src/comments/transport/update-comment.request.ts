import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateCommentRequest {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;
}
