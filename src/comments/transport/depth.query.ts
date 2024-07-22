import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNumber } from "class-validator";

@Exclude()
export class DepthQuery {
  @Expose()
  @ApiProperty({
    default: 5,
    required: false,
    type: "number",
  })
  @IsNumber()
  depth!: number;
}
