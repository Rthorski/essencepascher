import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { StationsService } from '../stations.service';
import { FindPricePipe } from '../find-price.pipe';
import { FindMajPipe } from '../find-maj.pipe';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Station } from '../models/station';
import { forkJoin, switchMap, map, concatMap, tap, catchError, of } from 'rxjs';

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
  @Input() geoClicked!: boolean;
  @Input() latitude!: number;
  @Input() longitude!: number;

  @Output() stationOver: EventEmitter<any> = new EventEmitter();
  @Output() stationOut: EventEmitter<any> = new EventEmitter();

  stations: any[] = [];
  test: boolean = true;
  stationsWithNames: any[] = [];
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
  displayedColumnsFiltered!: string[];

  fuelColumns = [
    { key: 'gazole', label: 'Gazole' },
    { key: 'sp95', label: 'SP95' },
    { key: 'e10', label: 'SP95-E10' },
    { key: 'sp98', label: 'SP98' },
    { key: 'e85', label: 'E85' },
    { key: 'gplc', label: 'GPLC' },
  ];

  fuelColumnsFiltered!: any[];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatSort) sort!: MatSort;
  constructor(private stationService: StationsService) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.stationService.stations$
      .pipe(
        switchMap((stations: any[]) => {
          const updateNames$ = stations.map((station) =>
            this.stationService.getStationsName(station.id).pipe(
              tap((data) =>
                console.log('api data for station', station.id, ':', data)
              ),
              catchError((error) => {
                console.error('error for station', station.id, ':', error);
                return of(null);
              })
            )
          );
          return forkJoin(updateNames$).pipe(
            map((nestedArray) => [].concat(...nestedArray)),
            map((data) => (this.stationsWithNames = data)),
            tap((data) => console.log('forkJoin data', data)),
            concatMap(() =>
              of(this.stationsWithNames).pipe(
                tap((data) => console.log('of data', data))
              )
            )
          );
        })
      )
      .subscribe((stations: any[]) => {
        this.stations = stations;
        this.stationsTransform = this.stationService.transformToStationModel(
          this.stationsWithNames
        );
        this.stationsTransform.forEach((station) => {
          station.distance = this.calculeDistance(
            this.latitude,
            this.longitude,
            station.latitude,
            station.longitude
          );
        });
        console.log(this.stationsTransform);
        this.dataSource.data = this.stationsTransform;
        this.fuelColumnsFiltered = this.fuelColumns
          .slice()
          .filter((column) =>
            this.dataSource.data.some(
              (station) =>
                station[column.key].valeur !== null &&
                station[column.key].valeur !== 0
            )
          );

        this.displayedColumnsFiltered = this.displayedColumns.filter((column) =>
          ['id', ...this.fuelColumnsFiltered.map((fuel) => fuel.key)].includes(
            column
          )
        );
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
  onMouseOver(event: MouseEvent, row): void {
    const rowOver = { lat: row.latitude, lon: row.longitude };
    this.stationOver.emit(rowOver);
  }

  onMouseOut(event: MouseEvent): void {
    this.stationOut.emit(event);
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  calculeDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {}
}
