import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ErrorResponse {
  @Expose()
  @ApiProperty()
  statusCode!: number;

  @Expose()
  @ApiProperty()
  timestamp!: Date;

  @Expose()
  @ApiProperty()
  path!: string;

  @Expose()
  @ApiProperty({
    anyOf: [
      {
        type: "string",
      },
      {
        type: "array",
        items: {
          type: "string",
        },
      },
    ],
  })
  message!: string | string[];
}
