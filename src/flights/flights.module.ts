import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { Flight, FlightSchema } from './schemas/flight.schema';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Flight.name, schema: FlightSchema }]), HttpModule],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}
