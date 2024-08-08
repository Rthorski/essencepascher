import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {} from '@angular/google-maps';
import { debounceTime, distinctUntilChanged, fromEvent, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Location {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss',
})
export class SearchBoxComponent implements AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @Output() locationSelected: EventEmitter<any> = new EventEmitter();
  @Input() resetInput!: boolean;
  @Output() inputResetRequested = new EventEmitter<void>();
  location: any;
  predictions: any[] = [];

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    fromEvent<Event>(this.searchInput.nativeElement, 'input')
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((event) =>
          this.http.get<any[]>(
            `http://localhost:3000/api/autocomplete?input=${
              (event.target as HTMLInputElement).value
            }`
          )
        )
      )
      .subscribe((predictions: any[]) => {
        this.predictions = predictions;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetInput'] && this.resetInput) {
      this.searchInput.nativeElement.value = '';
    }
  }

  onPredictionSelected(prediction: any) {
    this.http
      .get(
        `http://localhost:3000/api/place-details?place_id=${prediction.place_id}`
      )
      .subscribe((placeDetails: any) => {
        this.location = {
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng,
        };
        this.searchInput.nativeElement.value = prediction.description;
        this.locationSelected.emit(this.location);
        this.predictions = [];
        this.inputResetRequested.emit();
      });
  }
}
