import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AirlineDto {
  @IsString()
  iataCode: string;

  @IsString()
  icaoCode: string;

  @IsString()
  name: string;
}

class ArrivalDto {
  @IsOptional()
  @IsString()
  actualRunway?: string;

  @IsOptional()
  @IsString()
  actualTime?: string;

  @IsOptional()
  @IsString()
  baggage?: string;

  @IsOptional()
  @IsString()
  delay?: string;

  @IsOptional()
  @IsString()
  estimatedRunway?: string;

  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @IsOptional()
  @IsString()
  gate?: string;

  @IsString()
  iataCode: string;

  @IsString()
  icaoCode: string;

  @IsString()
  scheduledTime: string;

  @IsOptional()
  @IsString()
  terminal?: string;
}

class DepartureDto {
  @IsOptional()
  @IsString()
  actualRunway?: string;

  @IsOptional()
  @IsString()
  actualTime?: string;

  @IsOptional()
  baggage: any;

  @IsOptional()
  @IsString()
  delay?: string;

  @IsOptional()
  @IsString()
  estimatedRunway?: string;

  @IsString()
  estimatedTime: string;

  @IsOptional()
  @IsString()
  gate?: string;

  @IsString()
  iataCode: string;

  @IsString()
  icaoCode: string;

  @IsString()
  scheduledTime: string;

  @IsOptional()
  @IsString()
  terminal?: string;
}

class FlightDto {
  @IsString()
  iataNumber: string;

  @IsString()
  icaoNumber: string;

  @IsOptional()
  @IsString()
  number?: string;
}

export class CreateTimetableDto {
  @IsString()
  timetable_date: string;

  @ValidateNested()
  @Type(() => AirlineDto)
  airline: AirlineDto;

  @ValidateNested()
  @Type(() => ArrivalDto)
  arrival: ArrivalDto;

  @IsOptional()
  @IsString()
  codeshared?: string;

  @ValidateNested()
  @Type(() => DepartureDto)
  departure: DepartureDto;

  @ValidateNested()
  @Type(() => FlightDto)
  flight: FlightDto;

  @IsString()
  status: string;

  @IsString()
  type: string;
}
