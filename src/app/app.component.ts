import { Component } from '@angular/core';
import { WeatherService } from './services/weather.service';
import { Forecast } from './models/interfaces/forecast.interface';
import { City } from './models/interfaces/city.interface';
import { GeoLocationService } from './services/geo-location.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public citiesList: City[] = [];
  public searchInput = '';
  public currentCityWeather: Forecast | null = null;
  public showCitites = false;
  public currentCity: City | null = null;
  public weatherInterpretationCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear, partly cloudy, and overcast',
    2: 'Mainly clear, partly cloudy, and overcast',
    3: 'Mainly clear, partly cloudy, and overcast',
    45: 'Fog and depositing rime fog',
    48: 'Fog and depositing rime fog',
    51: 'Drizzle: Light, moderate, and dense intensity',
    53: 'Drizzle: Light, moderate, and dense intensity',
    55: 'Drizzle: Light, moderate, and dense intensity',
    56: 'Freezing Drizzle: Light and dense intensity',
    57: 'Freezing Drizzle: Light and dense intensity',
    61: 'Rain: Slight, moderate and heavy intensity',
    63: 'Rain: Slight, moderate and heavy intensity',
    66: 'Freezing Rain: Light and heavy intensity',
    67: 'Freezing Rain: Light and heavy intensity',
    71: 'Snow fall: Slight, moderate, and heavy intensity',
    73: 'Snow fall: Slight, moderate, and heavy intensity',
    75: 'Snow fall: Slight, moderate, and heavy intensity',
    77: 'Snow grains',
    80: 'Rain showers: Slight, moderate, and violent',
    81: 'Rain showers: Slight, moderate, and violent',
    82: 'Rain showers: Slight, moderate, and violent',
    85: 'Snow showers slight and heavy',
    86: 'Snow showers slight and heavy',
    95: 'Thunderstorm: Slight or moderate',
    96: 'Thunderstorm with slight and heavy hail',
    99: 'Thunderstorm with slight and heavy hail',
  };
  public currentDate: string | null = null;

  constructor(
    private weatherService: WeatherService,
    private geoLocationService: GeoLocationService
  ) {}

  ngOnInit(): void {
    this.getCurrentLocationDetails();
  }

  public onSearchChange(): void {
    this.showCitites = false;
    if (this.searchInput.length < 3) {
      this.citiesList = [];
      // console.log('input <3');
    }
    if (this.searchInput.length >= 3) {
      this.weatherService.searchCity(this.searchInput).subscribe(
        (cityResult) => {
          this.citiesList = cityResult.results;
          this.showCitites = true;
          //console.log(this.citiesList);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  public onCityClick(city: City): void {
    console.log(city);
    this.weatherService.getCityWeather(city).subscribe((cityWeather) => {
      this.currentCityWeather = cityWeather;
      this.showCitites = false;
      this.searchInput = '';
      this.citiesList = [];
      this.currentCity = city;
      const newDate = new Date(this.currentCityWeather.current_weather.time);
      this.currentDate = newDate.toDateString();
    });
  }

  public hideCititesList(): void {
    setTimeout(() => {
      this.showCitites = false;
    }, 300);
  }

  //
  private getCurrentLocationDetails(): void {
    navigator.geolocation.getCurrentPosition((response) => {
      console.log(response);
      this.geoLocationService
        .getCityByCoordinates(
          response.coords.latitude,
          response.coords.longitude
        )
        .subscribe((res: any) => {
          this.currentCity = {
            name: res.address.town,
            country: res.address.country,
            timezone: 'auto',
            latitude: response.coords.latitude,
            longitude: response.coords.longitude,
          };
          this.weatherService
            .getCityWeather(this.currentCity)
            .subscribe((cityWeather) => {
              this.currentCityWeather = cityWeather;
            });
        });
    });
  }
}
