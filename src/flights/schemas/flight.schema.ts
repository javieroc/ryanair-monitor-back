import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type FlightDocument = HydratedDocument<Flight>;

@Schema()
export class Flight {
  @Prop({ type: String })
  flight_date: string;

  @Prop({ type: String })
  flight_status: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
    scheduled: string;
    estimated: string;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string | null;
    gate: string | null;
    baggage: string | null;
    delay: number | null;
    scheduled: string;
    estimated: string;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  airline: {
    name: string;
    iata: string;
    icao: string;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  flight: {
    number: string;
    iata: string;
    icao: string;
    codeshared: string | null;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  aircraft: {
    registration: string;
    iata: string;
    icao: string;
    icao24: string;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
  live: any;
}

export const FlightSchema = SchemaFactory.createForClass(Flight);
