import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FlightsService } from './flights.service';
import { QueryDto } from './dto/query.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  create(@Body() createFlightDto: CreateFlightDto) {
    return this.flightsService.create(createFlightDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.flightsService.findAll(paginationDto);
  }

  @Get('stats')
  getStats(@Query() queryParamsDto: QueryDto) {
    return this.flightsService.getStats(queryParamsDto);
  }
}
