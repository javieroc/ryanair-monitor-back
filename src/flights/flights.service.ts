import { lastValueFrom } from 'rxjs';
import { format } from 'date-fns';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { StatsResponseDto } from './dto/stats-response.dto';
import { FindAllResponse } from 'src/dto/response.dto';
import { Flight } from './schemas/flight.schema';
import { QueryStatsDto } from './dto/query-stats.dto';
import { QueryParamsDto } from './dto/query-params.dto';

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);
  private readonly apiUrl = 'https://api.aviationstack.com/v1/flights';
  private readonly accessKey = '731cbdbc3b2747fdc8ca7329374bfd59';
  private readonly airlineName = 'RYANAIR';

  constructor(
    @InjectModel(Flight.name) private flightModel: Model<Flight>,
    private readonly httpService: HttpService,
  ) {}

  async create(createFlightDto: any): Promise<Flight> {
    const existingFlight = await this.flightModel
      .findOne({ 'flight.number': createFlightDto.flight.number })
      .exec();

    if (existingFlight) {
      this.logger.warn(
        `Flight with number ${createFlightDto.flight.number} already exists. Skipping.`,
      );
      return existingFlight;
    }

    const flight = new this.flightModel(createFlightDto);
    return flight.save();
  }

  async findAll({
    limit,
    offset,
    flightDate,
  }: QueryParamsDto): Promise<FindAllResponse<Flight>> {
    const matchCondition: any = {};
    matchCondition.flight_date = flightDate ?? format(new Date(), 'yyyy-MM-dd');

    const total = await this.flightModel.countDocuments(matchCondition).exec();
    const data = await this.flightModel
      .aggregate([
        { $match: matchCondition },
        {
          $addFields: {
            sortPriority: {
              $cond: {
                if: { $eq: ['$flight_status', 'cancelled'] },
                then: 0,
                else: 1,
              },
            },
          },
        },
        { $sort: { sortPriority: 1, 'departure.delay': -1 } },
        ...(offset !== undefined ? [{ $skip: offset }, { $limit: limit }] : []),
      ])
      .exec();

    return {
      data,
      total,
    };
  }

  async getStats({ flightDate }: QueryStatsDto): Promise<StatsResponseDto> {
    const matchCondition: any = {};
    matchCondition.flight_date = flightDate ?? format(new Date(), 'yyyy-MM-dd');

    try {
      const flightsTotal = await this.flightModel
        .countDocuments(matchCondition)
        .exec();
      const cancelled = await this.flightModel
        .countDocuments({
          flight_status: 'cancelled',
          ...matchCondition,
        })
        .exec();

      const delayedMoreThan45Min = await this.flightModel
        .countDocuments({
          'departure.delay': { $gt: 45 },
          ...matchCondition,
        })
        .exec();

      const delayedBetween30And45Min = await this.flightModel
        .countDocuments({
          'departure.delay': { $gt: 30, $lte: 45 },
          ...matchCondition,
        })
        .exec();

      const delayedBetween15And30Min = await this.flightModel
        .countDocuments({
          'departure.delay': { $gt: 15, $lte: 30 },
          ...matchCondition,
        })
        .exec();

      const delayedBetween0And15Min = await this.flightModel
        .countDocuments({
          'departure.delay': { $gte: 0, $lte: 15 },
          ...matchCondition,
        })
        .exec();

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

  @Cron(CronExpression.EVERY_10_HOURS)
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
    await flights.reduce(
      async (prev, flight) => {
        try {
          await prev;
          this.logger.debug(`Processing flight: ${JSON.stringify(flight)}`);

          return this.create(flight);
        } catch (err) {
          this.logger.log(
            `Error saving the flight register into MongoDB: ${JSON.stringify(err)}`,
          );
        }
      },
      Promise.resolve({}) as Promise<Flight>,
    );
  }
}
