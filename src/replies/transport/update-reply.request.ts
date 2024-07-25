import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateReplyRequest {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;
}
