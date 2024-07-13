import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

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
}
