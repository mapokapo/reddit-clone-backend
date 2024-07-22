import { ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsEnum, IsOptional } from "class-validator";
import { UserDataType } from "../dtos/user-data-type.dto";

@Exclude()
export class GetUserDataQuery {
  @Expose()
  @ApiPropertyOptional({
    description: "The data to include in the response",
    enum: UserDataType,
    isArray: true,
  })
  @IsEnum(UserDataType)
  @IsOptional()
  include?: UserDataType[];
}
