import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private apiUrl = 'http://localhost:3000/api/v1/essencepascher/charts';

  constructor(private http: HttpClient) {}

  getMartOneYearPriceTrend(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getMartOneYearPriceTrend`);
  }

  getMartOneYearYtd(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getMartOneYearYtd`);
  }
}
