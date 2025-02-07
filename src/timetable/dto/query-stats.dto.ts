import { IsOptional, IsString } from 'class-validator';

export class QueryStatsDto {
  @IsOptional()
  @IsString()
  timetable_date?: string;
}
