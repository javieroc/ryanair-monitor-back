import { IsOptional, IsString } from 'class-validator';

export class QueryStatsDto {
  @IsOptional()
  @IsString()
  flightDate?: string;
}
