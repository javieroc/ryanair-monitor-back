import { Injectable, Logger } from '@nestjs/common';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Timetable } from './schemas/timetable.schema';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { FindAllResponse } from 'src/dto/response.dto';
import { format } from 'date-fns';
import { QueryParamsDto } from './dto/query-params.dto';
import { QueryStatsDto } from './dto/query-stats.dto';
import { StatsResponseDto } from './dto/stats-response.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';

export interface TimetableResponse {
  pagination: Pagination;
  data: CreateTimetableDto[];
}

export interface Pagination {
  limit: any;
  offset: any;
  count: number;
  total: number;
}

@Injectable()
export class TimetableService {
  private readonly logger = new Logger(TimetableService.name);
  private readonly apiUrl = 'https://api.aviationstack.com/v1/timetable';
  private readonly accessKey = process.env.AVIATIONSTACK_ACCESS_KEY;
  private readonly iataCode = 'DUB';
  private readonly type = 'departure';
  private readonly airline_names = ['Ryanair', 'Aer Lingus'];

  constructor(
    @InjectModel(Timetable.name) private timetableModel: Model<Timetable>,
    private readonly httpService: HttpService,
  ) {}

  async create({
    departure,
    arrival,
    ...createTimetableDto
  }: CreateTimetableDto): Promise<Timetable> {
    const existingTimetable = await this.timetableModel
      .findOne({
        'flight.iataNumber': createTimetableDto.flight.iataNumber,
        timetable_date: createTimetableDto.timetable_date,
      })
      .exec();

    if (existingTimetable) {
      this.logger.warn(
        `Record with flight iataNumber ${createTimetableDto.flight.iataNumber} for the current day already exists. Skipping.`,
      );
      return existingTimetable;
    }

    const timetable = new this.timetableModel({
      departure: {
        ...departure,
        delay: departure.delay ? Number.parseInt(departure.delay) : null,
      },
      arrival: {
        ...arrival,
        delay: arrival.delay ? Number.parseInt(arrival.delay) : null,
      },
      ...createTimetableDto,
    });
    return timetable.save();
  }

  async findAll({
    limit,
    offset,
    flightDate,
    airline,
  }: QueryParamsDto): Promise<FindAllResponse<Timetable>> {
    const matchCondition: any = {};
    matchCondition.timetable_date =
      flightDate ?? format(new Date(), 'yyyy-MM-dd');
    matchCondition['airline.name'] = airline ?? 'Ryanair';

    const total = await this.timetableModel
      .countDocuments(matchCondition)
      .exec();
    const data = await this.timetableModel
      .aggregate([
        { $match: matchCondition },
        {
          $addFields: {
            sortPriority: {
              $cond: {
                if: { $eq: ['$status', 'cancelled'] },
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

  async getStats({
    flightDate,
    airline,
  }: QueryStatsDto): Promise<StatsResponseDto> {
    const matchCondition: any = {};
    matchCondition.timetable_date =
      flightDate ?? format(new Date(), 'yyyy-MM-dd');
    matchCondition['airline.name'] = airline ?? 'Ryanair';

    try {
      const flightsTotal = await this.timetableModel
        .countDocuments(matchCondition)
        .exec();
      const cancelled = await this.timetableModel
        .countDocuments({
          status: 'cancelled',
          ...matchCondition,
        })
        .exec();

      const delayedMoreThan45Min = await this.timetableModel
        .countDocuments({
          'departure.delay': { $gt: 45 },
          ...matchCondition,
        })
        .exec();

      const delayedBetween30And45Min = await this.timetableModel
        .countDocuments({
          'departure.delay': { $gt: 30, $lte: 45 },
          ...matchCondition,
        })
        .exec();

      const delayedBetween15And30Min = await this.timetableModel
        .countDocuments({
          'departure.delay': { $gt: 15, $lte: 30 },
          ...matchCondition,
        })
        .exec();

      const delayedBetween0And15Min = await this.timetableModel
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

  async getFlightWithHighestDelay({
    flightDate,
    airline,
  }: QueryStatsDto): Promise<Timetable> {
    try {
      const flightWithHighestDelay = await this.timetableModel
        .findOne({
          timetable_date: flightDate ?? format(new Date(), 'yyyy-MM-dd'),
          'airline.name': airline ?? 'Ryanair',
        })
        .sort({ 'departure.delay': -1 })
        .exec();
      return flightWithHighestDelay;
    } catch (error) {
      this.logger.error(
        `Error fetching flight with highest delay: ${error.message}`,
      );
    }
  }

  async getAverageDelay({
    flightDate,
    airline,
  }: QueryStatsDto): Promise<{ averageDelay: number }> {
    try {
      const result = await this.timetableModel
        .aggregate([
          {
            $match: {
              timetable_date: flightDate ?? format(new Date(), 'yyyy-MM-dd'),
              'airline.name': airline ?? 'Ryanair',
            },
          },
          {
            $group: {
              _id: null,
              averageDelay: { $avg: '$departure.delay' },
            },
          },
        ])
        .exec();
      return {
        averageDelay:
          result.length > 0 ? Math.round(result[0].averageDelay) : 0,
      };
    } catch (error) {
      this.logger.error(`Error calculating average delay: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateFlightsData() {
    this.logger.log('Started fetching flight data...');

    await this.airline_names.reduce(async (prev, airline_name) => {
      try {
        await prev;
        return this.fetchTimetables(airline_name);
      } catch (error) {
        this.logger.error(JSON.stringify(error));
        this.logger.error(`Error fetching data for airline: ${airline_name}`);
      }
    }, Promise.resolve() as Promise<void>);
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateRyanairFlightsData() {
    this.logger.log('Started fetching Ryanair flight data...');
    try {
      return this.fetchTimetables('Ryanair');
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.logger.error('Error fetching data for airline: Ryanair');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_5PM)
  async updateAerLingusFlightsData() {
    this.logger.log('Started fetching Aer Lingus flight data...');
    try {
      return this.fetchTimetables('Aer Lingus');
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.logger.error('Error fetching data for airline: Aer Lingus');
    }
  }

  async fetchTimetables(airline_name: string): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<TimetableResponse>(this.apiUrl, {
          params: {
            access_key: this.accessKey,
            iataCode: this.iataCode,
            type: this.type,
            airline_name,
          },
        }),
      );

      const { data } = response.data;

      await this.processTimetablesData(data);
    } catch (error) {
      this.logger.error('Error fetching timetables', error.message);
    }
  }

  private async processTimetablesData(
    timetables: CreateTimetableDto[],
  ): Promise<void> {
    await timetables.reduce(
      async (prev, timetable) => {
        try {
          await prev;
          this.logger.debug(
            `Processing timetable: ${JSON.stringify(timetable)}`,
          );

          return this.create({
            timetable_date: format(new Date(), 'yyyy-MM-dd'),
            ...timetable,
          });
        } catch (err) {
          this.logger.log(
            `Error saving the timetable register into MongoDB: ${JSON.stringify(err)}`,
          );
        }
      },
      Promise.resolve({}) as Promise<Timetable>,
    );
  }
}
