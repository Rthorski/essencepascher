import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  AfterViewInit,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-chart-one-year-price-trend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-one-year-price-trend.component.html',
  styleUrl: './chart-one-year-price-trend.component.scss',
})
export class ChartOneYearPriceTrendComponent
  implements AfterViewInit, OnChanges
{
  @Input() martOneYear!: any;
  @Input() title!: string;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  ngAfterViewInit(): void {
    if (this.martOneYear) {
      this.createChart(this.martOneYear, this.title);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['martOneYear'] && changes['martOneYear'].currentValue) {
      this.createChart(changes['martOneYear'].currentValue, this.title);
    }
  }

  createChart(data: any[], title: string): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((item) => item.date_series), // Remplacez 'label' par la propriété appropriée de vos données
        datasets: [
          {
            label: 'Gazole',
            data: data.map((item) => item.avg_gazole), // Remplacez 'value' par la propriété appropriée de vos données
            fill: false,
            borderColor: 'rgb(255, 160, 0)',
            tension: 0.7,
            spanGaps: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,
          },
          {
            label: 'SP98',
            data: data.map((item) => item.avg_sp98), // Remplacez 'value' par la propriété appropriée de vos données
            fill: false,
            borderColor: 'rgb(0, 180, 0)',
            tension: 0.7,
            spanGaps: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,
          },
          {
            label: 'SP95',
            data: data.map((item) => item.avg_sp95), // Remplacez 'value' par la propriété appropriée de vos données
            fill: false,
            borderColor: 'rgb(0, 200, 0)',
            tension: 0.7,
            spanGaps: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,
          },
          {
            label: 'E10',
            data: data.map((item) => item.avg_e10), // Remplacez 'value' par la propriété appropriée de vos données
            fill: false,
            borderColor: 'rgb(0, 210, 200)',
            tension: 0.7,
            spanGaps: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,
          },
          {
            label: 'E85',
            data: data.map((item) => item.avg_e85), // Remplacez 'value' par la propriété appropriée de vos données
            fill: false,
            borderColor: 'rgb(0, 2, 200)',
            tension: 0.7,
            spanGaps: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,
          },
          {
            label: 'GPLc',
            data: data.map((item) => item.avg_gplc), // Remplacez 'value' par la propriété appropriée de vos données
            fill: false,
            borderColor: 'rgb(0, 0, 0)',
            tension: 0.7,
            spanGaps: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 20,
            },
            position: 'top',
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            grid: {
              display: false,
            },
            beginAtZero: false,
          },
        },
      },
    });
  }
}
