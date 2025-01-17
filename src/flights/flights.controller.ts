import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { PaginationDto } from 'src/dto/pagination.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  create(@Body() createFlightDto: CreateFlightDto) {
    return this.flightsService.create(createFlightDto);
  }

  @Get()
  findAll(@Query() queryParamsDto: PaginationDto) {
    return this.flightsService.findAll(queryParamsDto);
  }
}
