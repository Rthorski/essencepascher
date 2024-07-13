import { Component, OnInit } from '@angular/core';
import { StationsService } from '../stations.service';

@Component({
  selector: 'app-results',
  standalone: true,
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent implements OnInit {
  stations: any[] = [];

  constructor(private stationService: StationsService) {}

  ngOnInit(): void {
    this.stationService.currentStations.subscribe((stations: any[]) => {
      this.stations = stations;
      console.log(stations);
    });
  }
}
