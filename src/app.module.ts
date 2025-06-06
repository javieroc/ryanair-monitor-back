import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
// import { FlightsModule } from './flights/flights.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimetableModule } from './timetable/timetable.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_URI),
    ScheduleModule.forRoot(),
    // FlightsModule,
    TimetableModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
