import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeoLocationService {
  private geoLocationReverseUrl =
    'https://nominatim.openstreetmap.org/reverse?format=json&';

  constructor(private http: HttpClient) {}

  public getCityByCoordinates(latitude: number, longitude: number) {
    return this.http.get(
      this.geoLocationReverseUrl + 'lat=' + latitude + '&lon=' + longitude
    );
  }
}
