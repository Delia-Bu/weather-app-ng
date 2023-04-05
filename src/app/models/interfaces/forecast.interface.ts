import { CurrentWeather } from './current-weather.interface';
import { DailyUnits } from './daily-units.interface';
import { Daily } from './daily.interface';

export interface Forecast {
  current_weather: CurrentWeather;
  daily: Daily;
  daily_units: DailyUnits;
}
