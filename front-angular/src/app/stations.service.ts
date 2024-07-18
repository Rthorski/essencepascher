import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Station } from './models/station';

@Injectable({
  providedIn: 'root',
})
export class StationsService {
  private apiUrl = 'http://localhost:3000/api/v1/essencepascher/stations/test/';
  private stationsSource = new BehaviorSubject<any[]>([]);
  currentStations = this.stationsSource.asObservable();

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
    this.stationsSource.next(stations);
  }

  transformToStationModel(stations: any[]): Station[] {
    return stations.map((station) => {
      return {
        id: station.id,
        pop: station.geolocalisation[0].pop,
        town: station.geolocalisation[0].town,
        adresse: station.geolocalisation[0].adresse,
        latitude: station.geolocalisation[0].latitude,
        longitude: station.geolocalisation[0].longitude,
        gazole: {
          id:
            station.json_prix.filter((element) => element.id === 1).length > 0
              ? parseInt(
                  station.json_prix
                    .filter((element) => element.id === 1)
                    .map((element) => element.id)
                )
              : null,
          maj: new Date(
            station.json_prix
              .filter((element) => element.id === 1)
              .map((element) => element.maj)
          ),
          nom: String(
            station.json_prix
              .filter((element) => element.id === 1)
              .map((element) => element.nom)
          ),
          valeur:
            station.json_prix.filter((element) => element.id === 1).length > 0
              ? parseFloat(
                  station.json_prix
                    .filter((element) => element.id === 1)
                    .map((element) => element.valeur)
                )
              : null,
        },
        sp95: {
          id:
            station.json_prix.filter((element) => element.id === 2).length > 0
              ? parseInt(
                  station.json_prix
                    .filter((element) => element.id === 2)
                    .map((element) => element.id)
                )
              : null,
          maj: new Date(
            station.json_prix
              .filter((element) => element.id === 2)
              .map((element) => element.maj)
          ),
          nom: String(
            station.json_prix
              .filter((element) => element.id === 2)
              .map((element) => element.nom)
          ),
          valeur:
            station.json_prix.filter((element) => element.id === 2).length > 0
              ? parseFloat(
                  station.json_prix
                    .filter((element) => element.id === 2)
                    .map((element) => element.valeur)
                )
              : null,
        },
        e10: {
          id:
            station.json_prix.filter((element) => element.id === 5).length > 0
              ? parseInt(
                  station.json_prix
                    .filter((element) => element.id === 5)
                    .map((element) => element.id)
                )
              : null,
          maj: new Date(
            station.json_prix
              .filter((element) => element.id === 5)
              .map((element) => element.maj)
          ),
          nom: String(
            station.json_prix
              .filter((element) => element.id === 5)
              .map((element) => element.nom)
          ),
          valeur:
            station.json_prix.filter((element) => element.id === 5).length > 0
              ? parseFloat(
                  station.json_prix
                    .filter((element) => element.id === 5)
                    .map((element) => element.valeur)
                )
              : null,
        },
        sp98: {
          id:
            station.json_prix.filter((element) => element.id === 6).length > 0
              ? parseInt(
                  station.json_prix
                    .filter((element) => element.id === 6)
                    .map((element) => element.id)
                )
              : null,
          maj: new Date(
            station.json_prix
              .filter((element) => element.id === 6)
              .map((element) => element.maj)
          ),
          nom: String(
            station.json_prix
              .filter((element) => element.id === 6)
              .map((element) => element.nom)
          ),
          valeur:
            station.json_prix.filter((element) => element.id === 6).length > 0
              ? parseFloat(
                  station.json_prix
                    .filter((element) => element.id === 6)
                    .map((element) => element.valeur)
                )
              : null,
        },
        e85: {
          id:
            station.json_prix.filter((element) => element.id === 3).length > 0
              ? parseInt(
                  station.json_prix
                    .filter((element) => element.id === 3)
                    .map((element) => element.id)
                )
              : null,
          maj: new Date(
            station.json_prix
              .filter((element) => element.id === 3)
              .map((element) => element.maj)
          ),
          nom: String(
            station.json_prix
              .filter((element) => element.id === 3)
              .map((element) => element.nom)
          ),
          valeur:
            station.json_prix.filter((element) => element.id === 3).length > 0
              ? parseFloat(
                  station.json_prix
                    .filter((element) => element.id === 3)
                    .map((element) => element.valeur)
                )
              : null,
        },
        gplc: {
          id:
            station.json_prix.filter((element) => element.id === 4).length > 0
              ? parseInt(
                  station.json_prix
                    .filter((element) => element.id === 4)
                    .map((element) => element.id)
                )
              : null,
          maj: new Date(
            station.json_prix
              .filter((element) => element.id === 4)
              .map((element) => element.maj)
          ),
          nom: String(
            station.json_prix
              .filter((element) => element.id === 4)
              .map((element) => element.nom)
          ),
          valeur:
            station.json_prix.filter((element) => element.id === 4).length > 0
              ? parseFloat(
                  station.json_prix
                    .filter((element) => element.id === 4)
                    .map((element) => element.valeur)
                )
              : null,
        },
      } as Station;
    });
  }
}
