import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type TimetableDocument = HydratedDocument<Timetable>;

@Schema()
export class Timetable {
  @Prop({ type: String })
  timetable_date: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  airline: {
    iataCode: string;
    icaoCode: string;
    name: string;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  arrival: {
    actualRunway?: string;
    actualTime?: string;
    baggage?: string;
    delay?: number;
    estimatedRunway?: string;
    estimatedTime?: string;
    gate?: string;
    iataCode: string;
    icaoCode: string;
    scheduledTime: string;
    terminal?: string;
  };

  @Prop({ type: String })
  codeshared?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  departure: {
    actualRunway?: string;
    actualTime?: string;
    baggage: any;
    delay?: number;
    estimatedRunway?: string;
    estimatedTime: string;
    gate?: string;
    iataCode: string;
    icaoCode: string;
    scheduledTime: string;
    terminal?: string;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  flight: {
    iataNumber: string;
    icaoNumber: string;
    number?: string;
  };

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  type: string;
}

export const TimetableSchema = SchemaFactory.createForClass(Timetable);
