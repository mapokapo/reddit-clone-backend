import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsOptional, IsString, IsUrl } from "class-validator";

@Exclude()
export class CreateUserRequest {
  @Expose()
  @ApiProperty()
  @IsString()
  name!: string;

  @Expose()
  @ApiPropertyOptional({
    format: "url",
  })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
