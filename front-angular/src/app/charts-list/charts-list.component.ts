import { Component, OnInit } from '@angular/core';
import { ChartOneYearPriceTrendComponent } from '../chart-one-year-price-trend/chart-one-year-price-trend.component';
import { ChartService } from '../chart.service';
import { Observable } from 'rxjs/internal/Observable';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-charts-list',
  standalone: true,
  imports: [ChartOneYearPriceTrendComponent, CommonModule],
  templateUrl: './charts-list.component.html',
  styleUrl: './charts-list.component.scss',
})
export class ChartsListComponent {
  martOneYearPriceTrend$!: Observable<any[]> | undefined;
  titlemartOneYearPriceTrend = 'Prix moyen des carburants sur un an';
  martOneYearYtd$!: Observable<any[]> | undefined;
  titlemartOneYearYtd = "Prix moyen des carburants depuis le début de l'année";

  constructor(private chartService: ChartService) {
    (this.martOneYearPriceTrend$ =
      this.chartService.getMartOneYearPriceTrend()),
      (this.martOneYearYtd$ = this.chartService.getMartOneYearYtd());
  }
}
