import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchCityResult } from '../models/interfaces/search-city-result.interface';
import { City } from '../models/interfaces/city.interface';
import { Forecast } from '../models/interfaces/forecast.interface';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';
  private geoLocationApiUrl = 'https://geocoding-api.open-meteo.com/v1/search';

  constructor(private http: HttpClient) {}

  public searchCity(keyword: string): Observable<SearchCityResult> {
    return this.http.get<SearchCityResult>(this.geoLocationApiUrl, {
      params: {
        name: keyword,
      },
    });
  }

  public getCityWeather(city: City): Observable<Forecast> {
    return this.http.get<Forecast>(this.weatherApiUrl, {
      params: {
        //static
        current_weather: true,
        forecast_days: 7,
        daily:
          'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode',
        hourly: 'temperature_2m',
        //
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone,
      },
    });
  }
}
