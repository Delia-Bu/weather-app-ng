export interface City {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  temp?: number;
  weathercode: number;
  tempMax?: number[];
  tempMin?: number[];
  precip?: number[];
}
