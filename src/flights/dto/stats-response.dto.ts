export class StatsResponseDto {
  flightsTotal: number;
  cancelled: number;
  delayedMoreThan45Min: number;
  delayedBetween30And45Min: number;
  delayedBetween15And30Min: number;
  delayedBetween0And15Min: number;
}
