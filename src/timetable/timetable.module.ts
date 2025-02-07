import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Timetable, TimetableSchema } from './schemas/timetable.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Timetable.name, schema: TimetableSchema },
    ]),
    HttpModule,
  ],
  controllers: [TimetableController],
  providers: [TimetableService],
})
export class TimetableModule {}
