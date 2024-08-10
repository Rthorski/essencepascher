import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { StationsService } from '../stations.service';
import { FindPricePipe } from '../find-price.pipe';
import { FindMajPipe } from '../find-maj.pipe';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Station } from '../models/station';
import {
  forkJoin,
  switchMap,
  map,
  concatMap,
  catchError,
  of,
  BehaviorSubject,
  Observable,
} from 'rxjs';

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
export class ResultsComponent implements AfterViewInit, OnInit, OnChanges {
  @Input() geoClicked!: boolean;
  @Input() latitude!: number;
  @Input() longitude!: number;
  @Input() fuelsSelectionned: string[] = [];

  @Output() stationOver: EventEmitter<any> = new EventEmitter();
  @Output() stationOut: EventEmitter<any> = new EventEmitter();
  @Output() stationsFilteredOutput: EventEmitter<Station[]> =
    new EventEmitter();
  @Output() fuelsInSelection = new EventEmitter<string[]>();

  @ViewChild(MatSort) sort!: MatSort;
  stations: any[] = [];
  test: boolean = true;
  stationsWithNames: any[] = [];
  stationsTransform: Station[] = [];
  stationsFiltered: Station[] = [];
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
  filterSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  listStationFiltered$!: Observable<Station[]>;

  constructor(private stationService: StationsService) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.fetchStationsAndUpdateNames().subscribe((stations: any[]) => {
      this.processStationsData(stations);
    });
  }

  private fetchStationsAndUpdateNames(): Observable<any[]> {
    return this.stationService.stations$.pipe(
      switchMap((stations: any[]) => {
        const updateNames$ = stations.map((station) =>
          this.stationService.getStationsName(station.id).pipe(
            catchError((error) => {
              console.error('error for station', station.id, ':', error);
              return of(null);
            })
          )
        );
        return forkJoin(updateNames$).pipe(
          map((nestedArray) => [].concat(...nestedArray)),
          map((data) => (this.stationsWithNames = data)),
          concatMap(() => of(this.stationsWithNames))
        );
      })
    );
  }

  private processStationsData(stations: any[]) {
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
    this.dataSource.data = this.stationsTransform;

    this.fuelColumnsFiltered = this.fuelColumns
      .slice()
      .filter((column) =>
        this.dataSource.data.some(
          (station) =>
            station[column.key].value !== null &&
            station[column.key].value !== 0
        )
      );
    this.fuelsInSelection.emit(this.fuelColumnsFiltered);

    this.filterSubject.subscribe((filters) => {
      this.stationsFiltered = this.selectStationsWithFuelFiltered(
        this.stationsTransform,
        filters
      );
      this.dataSource.data = this.stationsFiltered;
      this.stationsFilteredOutput.emit(this.stationsFiltered);
      this.updateDisplayedColumns(filters);
      this.sortData();
    });
    this.displayedColumnsFiltered = this.displayedColumns.filter((column) =>
      ['id', ...this.fuelColumnsFiltered.map((fuel) => fuel.key)].includes(
        column
      )
    );
    this.sortData();
  }

  selectStationsWithFuelFiltered(
    stations: Station[],
    filters: string[]
  ): Station[] {
    return stations.filter((station) => {
      return filters.some((filter) => {
        const fuel = station[filter as keyof Station] as unknown as {
          value: number | null;
        };
        return fuel.value !== null && fuel.value !== 0;
      });
    });
  }

  updateDisplayedColumns(filters: string[]): void {
    this.fuelColumnsFiltered = this.fuelColumns
      .slice()
      .filter((column) => filters.includes(column.key));

    this.displayedColumnsFiltered = this.displayedColumns.filter((column) =>
      ['id', ...this.fuelColumnsFiltered.map((fuel) => fuel.key)].includes(
        column
      )
    );
  }

  sortData(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      let value;
      switch (property) {
        case 'id':
          return item.id;
        case 'gazole':
          value =
            item.gazole.value !== null && item.gazole.value !== 0
              ? item.gazole.value
              : null;
          break;
        case 'sp95':
          value =
            item.sp95.value !== null && item.sp95.value !== 0
              ? item.sp95.value
              : null;
          break;
        case 'e10':
          value =
            item.e10.value !== null && item.e10.value !== 0
              ? item.e10.value
              : null;
          break;
        case 'sp98':
          value =
            item.sp98.value !== null && item.sp98.value !== 0
              ? item.sp98.value
              : null;
          break;
        case 'e85':
          value =
            item.e85.value !== null && item.e85.value !== 0
              ? item.e85.value
              : null;
          break;
        case 'gplc':
          value =
            item.gplc.value !== null && item.gplc.value !== 0
              ? item.gplc.value
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
  }

  onMouseOver(event: MouseEvent, row): void {
    const rowOver = { lat: row.latitude, lon: row.longitude };
    this.stationOver.emit(rowOver);
  }

  onMouseOut(event: MouseEvent): void {
    this.stationOut.emit(event);
  }

  isFuelSelected(fuel: string): boolean {
    return false;
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
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fuelsSelectionned']) {
      this.filterSubject.next(this.fuelsSelectionned);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {}
}
