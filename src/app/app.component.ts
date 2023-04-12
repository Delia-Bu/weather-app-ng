import { Component } from '@angular/core';
import { WeatherService } from './services/weather.service';
import { Forecast } from './models/interfaces/forecast.interface';
import { City } from './models/interfaces/city.interface';
import { GeoLocationService } from './services/geo-location.service';
import { DatePipe } from '@angular/common';
import { WeekDay } from './models/interfaces/weekDay.interface';
import { weatherInterpretationCodes } from './models/constants/weather-codes.const';
import { weatherIcons } from './models/constants/weather-icons.const';

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
  public weatherInterpretationCodes = weatherInterpretationCodes;
  public weatherIcons = weatherIcons;
  public currentIconImgPath: string = '';
  public currentDate: string | null = null;
  public weekForecastArray: any[] = [];
  public favouriteCities: City[] = [];

  constructor(
    private weatherService: WeatherService,
    private geoLocationService: GeoLocationService,
    public datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.getCurrentLocationDetails();
    this.loadLocalStorage();
  }

  public onSearchChange(): void {
    this.showCitites = false;
    if (this.searchInput.length < 3) {
      this.citiesList = [];
    }
    if (this.searchInput.length >= 3) {
      this.weatherService.searchCity(this.searchInput).subscribe(
        (cityResult) => {
          this.citiesList = cityResult.results;
          this.showCitites = true;
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  public onCityClick(city: City): void {
    this.weekForecastArray = []; //reset the weekly forecast
    this.weatherService.getCityWeather(city).subscribe((cityWeather) => {
      this.currentCityWeather = cityWeather;
      this.currentIconImgPath =
        this.weatherIcons[this.currentCityWeather.current_weather.weathercode];
      this.showCitites = false;
      this.searchInput = '';
      this.citiesList = [];
      this.currentCity = city;
      this.mapWeekForecast();
    });
  }

  public showSearch(): void {
    this.showCitites = true;
  }

  public hideCititesList(): void {
    setTimeout(() => {
      this.showCitites = false;
    }, 300);
  }

  public formatIcon(code: number): string {
    return this.weatherIcons[code];
  }

  public addToFavourites(city: City, cityWeather: Forecast) {
    if (
      !this.favouriteCities.find(
        (favouriteCity) => favouriteCity.name === city.name
      )
    ) {
      const newFavourite: City = {
        id: city.id,
        name: city.name,
        country: city.country,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone,
        temp: cityWeather.current_weather.temperature,
        weathercode: cityWeather.current_weather.weathercode,
        tempMax: cityWeather.daily.temperature_2m_max,
        tempMin: cityWeather.daily.temperature_2m_min,
        precip: cityWeather.daily.precipitation_probability_max,
      };
      this.favouriteCities.push(newFavourite);
      this.saveToLocalStorage();
    } else alert('City already added to favourites.');
  }

  public removeFavourite(favouriteCity: City): void {
    const cityIndex = this.favouriteCities.findIndex(
      (city) => city.name === favouriteCity.name
    );

    this.favouriteCities.splice(cityIndex, 1);
    this.saveToLocalStorage();
  }

  //
  private getCurrentLocationDetails(): void {
    navigator.geolocation.getCurrentPosition((response) => {
      this.geoLocationService
        .getCityByCoordinates(
          response.coords.latitude,
          response.coords.longitude
        )
        .subscribe((res: any) => {
          this.currentCity = {
            id: res.place_id,
            name: res.address.town,
            country: res.address.country,
            timezone: 'auto',
            latitude: response.coords.latitude,
            longitude: response.coords.longitude,
            weathercode: -1,
          };
          this.weatherService
            .getCityWeather(this.currentCity)
            .subscribe((cityWeather) => {
              this.currentCityWeather = cityWeather;
              this.mapWeekForecast();
            });
        });
    });
  }

  private formatDate(date: string): string | null {
    return this.datePipe.transform(date, 'EEEE');
  }

  private mapWeekForecast(): void {
    if (this.currentCityWeather) {
      this.currentIconImgPath =
        this.weatherIcons[this.currentCityWeather.current_weather.weathercode];
      for (
        let i = 1; //skip current day
        i < this.currentCityWeather.daily.temperature_2m_max.length;
        i++
      ) {
        const weekDay: WeekDay = {
          dayName: this.formatDate(this.currentCityWeather.daily.time[i]),
          tempMin: this.currentCityWeather.daily.temperature_2m_min[i],
          tempMax: this.currentCityWeather.daily.temperature_2m_max[i],
          weathercodeDay: this.currentCityWeather.daily.weathercode[i],
          precip:
            this.currentCityWeather.daily.precipitation_probability_max[i],
        };
        this.weekForecastArray.push(weekDay);
      }

      this.currentDate = this.datePipe.transform(
        this.currentCityWeather.current_weather.time,
        'fullDate'
      );
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(
      'favouriteCities',
      JSON.stringify(this.favouriteCities)
    );
  }

  private loadLocalStorage(): void {
    const favouriteCitiesStorage = localStorage.getItem('favouriteCities');
    if (favouriteCitiesStorage) {
      this.favouriteCities = JSON.parse(favouriteCitiesStorage);
    }
  }
}
