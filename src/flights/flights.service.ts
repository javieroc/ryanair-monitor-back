import { lastValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { StatsResponseDto } from './dto/stats-response.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { FindAllResponse } from 'src/dto/response.dto';
import { Flight } from './schemas/flight.schema';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);
  private readonly apiUrl = 'https://api.aviationstack.com/v1/flights';
  private readonly accessKey = '70270f49cd2f7ec7cf10dfe0175df6a5';
  private readonly airlineName = 'RYANAIR';

  constructor(
    @InjectModel(Flight.name) private flightModel: Model<Flight>,
    private readonly httpService: HttpService,
  ) {}

  async create(createFlightDto: any): Promise<Flight> {
    const existingFlight = await this.flightModel.findOne({ 'flight.number': createFlightDto.flight.number }).exec();

    if (existingFlight) {
      this.logger.warn(`Flight with number ${createFlightDto.flight.number} already exists. Skipping.`);
      return existingFlight;
    }
  
    const flight = new this.flightModel(createFlightDto);
    return flight.save();
  }

  async findAll(
    { limit = 10, offset = 0 }: PaginationDto,
  ): Promise<FindAllResponse<Flight>> {
    const total = await this.flightModel.countDocuments().exec();
    const data = await this.flightModel.find().limit(limit).skip(offset).exec();

    return {
      data,
      total,
    };
  }

  async getStats({ date }: QueryDto): Promise<StatsResponseDto> {
    try {
      const flightsTotal = await this.flightModel.countDocuments().exec();
      const cancelled = await this.flightModel.countDocuments({
        flight_status: 'cancelled',
      }).exec();

      const delayedMoreThan45Min = await this.flightModel.countDocuments({
        'departure.delay': { $gt: 45 },
      }).exec();

      const delayedBetween30And45Min = await this.flightModel.countDocuments({
        'departure.delay': { $gt: 30, $lte: 45 },
      }).exec();

      const delayedBetween15And30Min = await this.flightModel.countDocuments({
        'departure.delay': { $gt: 15, $lte: 30 },
      }).exec();

      const delayedBetween0And15Min = await this.flightModel.countDocuments({
        'departure.delay': { $gt: 0, $lte: 15 },
      }).exec();

      return {
        flightsTotal,
        cancelled,
        delayedMoreThan45Min,
        delayedBetween30And45Min,
        delayedBetween15And30Min,
        delayedBetween0And15Min,
      };
    } catch (error) {
      this.logger.error(`Error counting flights: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateFlightsData() {
    this.logger.log('Started fetching flight data...');
    try {
      await this.fetchFlights();
    } catch (error) {
      this.logger.error('Error fetching flight data', error.message);
    }
  }


  private async fetchFlights(): Promise<void> {
    const limit = 100;
    let offset = 0;
  
    try {
      while (true) {
        const response = await lastValueFrom(
          this.httpService.get(this.apiUrl, {
            params: {
              access_key: this.accessKey,
              airline_name: this.airlineName,
              limit,
              offset,
            },
          }),
        );

        const { data, pagination } = response.data;

        await this.processFlightData(data);

        if (offset + limit >= pagination.total) {
          this.logger.log('Finished fetching all flight data.');
          break;
        }

        offset += limit;
      }
    } catch (error) {
      this.logger.error(`Error fetching flight data`, error.message);
    }
  }

  private async processFlightData(flights: any[]): Promise<void> {
    await flights.reduce(async (prev, flight) => {
      try {
        await prev;
        this.logger.debug(`Processing flight: ${JSON.stringify(flight)}`);

        return this.create(flight);
      } catch (err) {
        this.logger.log(`Error saving the flight register into MongoDB: ${JSON.stringify(err)}`);
      }
    }, Promise.resolve({}) as Promise<Flight>);
  }
}
