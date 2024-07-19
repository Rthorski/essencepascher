import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { StationsService } from '../stations.service';
import { FindPricePipe } from '../find-price.pipe';
import { FindMajPipe } from '../find-maj.pipe';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
    CurrencyPipe,
    DecimalPipe,
  ],
})
export class ResultsComponent implements AfterViewInit, OnInit {
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

  fuelColumns = [
    { key: 'gazole', label: 'Gazole' },
    { key: 'sp95', label: 'SP95' },
    { key: 'e10', label: 'E10' },
    { key: 'sp98', label: 'SP98' },
    { key: 'e85', label: 'E85' },
    { key: 'gplc', label: 'GPLC' },
  ];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatSort) sort!: MatSort;
  constructor(private stationService: StationsService) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.stationService.stations$.subscribe((stations: any[]) => {
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
