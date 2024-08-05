import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Station } from './models/station';

@Injectable({
  providedIn: 'root',
})
export class StationsService {
  private apiUrl = 'http://localhost:3000/api/v1/essencepascher/stations';
  private stationsSource: BehaviorSubject<Station[]> = new BehaviorSubject<
    any[]
  >([]);
  public stations$: Observable<Station[]> = this.stationsSource.asObservable();

  public allStations$: Observable<any[]> = new Observable<any[]>();

  constructor(private http: HttpClient) {}

  getNearbyStations(
    latitude: number,
    longitude: number,
    radius: number
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/getNearbyStations/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
  }

  getAllStations(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getStationsName(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/name/${id}`);
  }

  updateStations(stations: any[]) {
    if (!Array.isArray(stations)) {
      console.error('stations doit être un tableau');
      return;
    }
    this.stationsSource.next(stations);
  }

  transformToStationModel(stations: any[]): Station[] {
    if (!stations || !Array.isArray(stations)) {
      console.error('stations doit être un tableau');
      return [];
    }

    return stations
      .map((station) => {
        if (
          !station ||
          !station.geolocalisation ||
          !station.geolocalisation[0]
        ) {
          console.error('station ou station.geolocalisation est invalide');
          return null;
        }

        const geoloc = station.geolocalisation[0];
        const jsonPrix = station.json_prices || [];
        const extractFuelInfo = (fuelId: number) => {
          const fuel = jsonPrix.find((element) => element.id === fuelId);
          if (!fuel) {
            return {
              id: null,
              fuel_updated_at: null,
              name: '',
              value: null,
            } as unknown as Station;
          }
          return {
            id: parseInt(fuel.id, 10),
            fuel_updated_at: new Date(fuel.fuel_updated_at),
            name: String(fuel.name),
            value: parseFloat(fuel.value),
          } as unknown as Station;
        };

        return {
          id: station.id,
          name: station.name,
          population: geoloc.population,
          city: geoloc.city,
          address: geoloc.address,
          latitude: geoloc.latitude,
          longitude: geoloc.longitude,
          distance: 0,
          gazole: extractFuelInfo(1),
          sp95: extractFuelInfo(2),
          e10: extractFuelInfo(5),
          sp98: extractFuelInfo(6),
          e85: extractFuelInfo(3),
          gplc: extractFuelInfo(4),
        } as unknown as Station;
      })
      .filter((station) => station !== null) as Station[];
  }
}
