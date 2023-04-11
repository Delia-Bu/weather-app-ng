import { Component } from '@angular/core';
import { WeatherService } from './services/weather.service';
import { Forecast } from './models/interfaces/forecast.interface';
import { City } from './models/interfaces/city.interface';
import { GeoLocationService } from './services/geo-location.service';
import { DatePipe } from '@angular/common';
import { WeekDay } from './models/interfaces/weekDay.interface';

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
  public weatherIcons: { [key: number]: string } = {
    0: '../assets/sun.png',
    1: '../assets/partly-clear.png',
    2: '../assets/partly-clear.png',
    3: '../assets/partly-clear.png',
    45: '../assets/foggy.png',
    48: '../assets/foggy.png',
    51: '../assets/drizzle.png',
    53: '../assets/drizzle.png',
    55: '../assets/drizzle.png',
    56: '../assets/freezing-drizzle.png',
    57: '../assets/freezing-drizzle.png',
    61: '../assets/rainy.png',
    63: '../assets/rainy.png',
    66: '../assets/heavy-rain.png',
    67: '../assets/heavy-rain.png',
    71: '../assets/snow.png',
    73: '../assets/snow.png',
    75: '../assets/snow.png',
    77: '../assets/snow.png',
    80: '../assets/heavy-rain.png',
    81: '../assets/heavy-rain.png',
    82: '../assets/heavy-rain.png',
    85: '../assets/snow.png',
    86: '../assets/snow.png',
    95: '../assets/scattered-thunderstorms.png',
    96: '../assets/thunderstorm.png',
    99: '../assets/thunderstorm.png',
  };
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
    // console.log(city);
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

      console.log(this.currentCity.id);
      console.log(this.currentCity);
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
      // console.log(response);
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
      // console.log('array forecast', this.weekForecastArray);
      this.currentDate = this.datePipe.transform(
        this.currentCityWeather.current_weather.time,
        'fullDate'
      );
    }
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
    // console.log(cityIndex);
    this.favouriteCities.splice(cityIndex, 1);
    this.saveToLocalStorage();
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
