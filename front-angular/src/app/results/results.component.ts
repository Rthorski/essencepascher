import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StationsService } from '../stations.service';
import { FindPricePipe } from '../find-price.pipe';
import { FindMajPipe } from '../find-maj.pipe';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Station } from '../models/station';

@Component({
  selector: 'app-results',
  standalone: true,
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  imports: [
    FindPricePipe,
    FindMajPipe,
    MatSortModule,
    MatTableModule,
    CommonModule,
  ],
})
export class ResultsComponent implements AfterViewInit {
  stations: any[] = [];
  stationsTransform: Station[] = [];
  displayedColumns: string[] = [
    'id',
    'gazole',
    'sp95',
    'e10',
    'sp98',
    'e85',
    'gplc',
  ];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private stationService: StationsService,
    private _liveAnnouncer: LiveAnnouncer
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.stationService.currentStations.subscribe((stations: any[]) => {
      this.stations = stations;
      this.stationsTransform =
        this.stationService.transformToStationModel(stations);
      this.dataSource.data = this.stationsTransform;
      this.dataSource.sortingDataAccessor = (item, property) => {
        let value;
        switch (property) {
          case 'id':
            return item.id;
          case 'gazole':
            value =
              item.gazole.valeur !== null && item.gazole.valeur !== 0
                ? item.gazole.valeur
                : null;
            break;
          case 'sp95':
            value =
              item.sp95.valeur !== null && item.sp95.valeur !== 0
                ? item.sp95.valeur
                : null;
            break;
          case 'e10':
            value =
              item.e10.valeur !== null && item.e10.valeur !== 0
                ? item.e10.valeur
                : null;
            break;
          case 'sp98':
            value =
              item.sp98.valeur !== null && item.sp98.valeur !== 0
                ? item.sp98.valeur
                : null;
            break;
          case 'e85':
            value =
              item.e85.valeur !== null && item.e85.valeur !== 0
                ? item.e85.valeur
                : null;
            break;
          case 'gplc':
            value =
              item.gplc.valeur !== null && item.gplc.valeur !== 0
                ? item.gplc.valeur
                : null;
            break;
          default:
            value = item[property];
        }
        if (value === null) {
          return this.sort.direction === 'asc' ? Infinity : -Infinity;
        } else {
          return value;
        }
      };
    });
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }
}
