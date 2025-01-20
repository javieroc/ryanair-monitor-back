import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CreateFlightDto } from './dto/create-flight.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { FlightsService } from './flights.service';
import { QueryStatsDto } from './dto/query-stats.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  create(@Body() createFlightDto: CreateFlightDto) {
    return this.flightsService.create(createFlightDto);
  }

  @Get()
  findAll(@Query() paramsDto: QueryParamsDto) {
    return this.flightsService.findAll(paramsDto);
  }

  @Get('stats')
  getStats(@Query() queryParamsDto: QueryStatsDto) {
    return this.flightsService.getStats(queryParamsDto);
  }
}
