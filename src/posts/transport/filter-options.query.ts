import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional } from "class-validator";

export enum SortBy {
  New = "new",
  Top = "top",
}

export enum Timespan {
  Day = "day",
  Week = "week",
  Month = "month",
  Year = "year",
  AllTime = "all-time",
}

@Exclude()
export class FilterOptionsQuery {
  @Expose()
  @Transform(
    ({ value }: { value: string | undefined }) =>
      value?.toLowerCase() ?? SortBy.New
  )
  @IsEnum(SortBy)
  @IsOptional()
  @ApiProperty({
    enum: SortBy,
    enumName: "SortBy",
    required: false,
    default: SortBy.New,
  })
  sortBy = SortBy.New;

  @Expose()
  @Transform(
    ({ value }: { value: string | undefined }) =>
      value?.toLowerCase() ?? Timespan.AllTime
  )
  @IsEnum(Timespan)
  @IsOptional()
  @ApiProperty({
    enum: Timespan,
    enumName: "Timespan",
    required: false,
    default: Timespan.AllTime,
  })
  timespan = Timespan.AllTime;

  @Expose()
  @Transform(({ value }: { value: string | undefined }) =>
    parseInt(value ?? "0")
  )
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: "number",
    required: false,
    default: 0,
  })
  skip = 0;

  @Expose()
  @Transform(({ value }: { value: string | undefined }) =>
    parseInt(value ?? "10")
  )
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: "number",
    required: false,
    default: 10,
  })
  take = 10;
}
