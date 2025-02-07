import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';

export class QueryParamsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  timetable_date?: string;
}
