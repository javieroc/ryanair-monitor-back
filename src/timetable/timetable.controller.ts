import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { QueryStatsDto } from './dto/query-stats.dto';

@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  create(@Body() createTimetableDto: CreateTimetableDto) {
    return this.timetableService.create(createTimetableDto);
  }

  @Get()
  findAll(@Query() paramsDto: QueryParamsDto) {
    return this.timetableService.findAll(paramsDto);
  }

  @Get('stats')
  getStats(@Query() queryParamsDto: QueryStatsDto) {
    return this.timetableService.getStats(queryParamsDto);
  }

  @Get('highest-delay')
  getMostDelayed(@Query() queryParamsDto: QueryStatsDto) {
    return this.timetableService.getFlightWithHighestDelay(queryParamsDto);
  }

  @Get('average-delay')
  getAverageDelay(@Query() queryParamsDto: QueryStatsDto) {
    return this.timetableService.getAverageDelay(queryParamsDto);
  }

  @Get('run-task')
  runTask(@Query('apiKey') key: string) {
    if (key !== process.env.SECRET_KEY) {
      throw new UnauthorizedException('Invalid Api key');
    }
    return this.timetableService.fetchTimetables();
  }
}
