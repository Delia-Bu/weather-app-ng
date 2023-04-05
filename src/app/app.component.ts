import { Component } from '@angular/core';
import { WeatherService } from './services/weather.service';
import { Forecast } from './models/interfaces/forecast.interface';
import { City } from './models/interfaces/city.interface';

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

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    console.log('mere');
  }

  public onSearchChange(): void {
    this.showCitites = false;
    if (this.searchInput.length < 3) {
      this.citiesList = [];
      console.log('mere');
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
    });
  }

  public hideCititesList(): void {
    setTimeout(() => {
      this.showCitites = false;
    }, 300);
  }
}
