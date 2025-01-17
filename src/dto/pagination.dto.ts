import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PaginationDto {
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsOptional()
  @IsInt()
  offset: number;

  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsOptional()
  @IsInt()
  limit: number;
}
