import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Station } from './models/station';

@Injectable({
  providedIn: 'root',
})
export class StationsService {
  private apiUrl = 'http://localhost:3000/api/v1/essencepascher/stations/test/';
  private stationsSource: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    []
  );
  public stations$: Observable<any[]> = this.stationsSource.asObservable();

  constructor(private http: HttpClient) {}
  getNearbyStations(
    latitude: number,
    longitude: number,
    radius: number
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
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
        const jsonPrix = station.json_prix || [];
        const extractFuelInfo = (fuelId: number) => {
          const fuel = jsonPrix.find((element) => element.id === fuelId);
          if (!fuel) {
            return {
              id: null,
              maj: null,
              nom: '',
              valeur: null,
            } as unknown as Station;
          }
          return {
            id: parseInt(fuel.id, 10),
            maj: new Date(fuel.maj),
            nom: String(fuel.nom),
            valeur: parseFloat(fuel.valeur),
          } as unknown as Station;
        };

        return {
          id: station.id,
          pop: geoloc.pop,
          town: geoloc.town,
          adresse: geoloc.adresse,
          latitude: geoloc.latitude,
          longitude: geoloc.longitude,
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
