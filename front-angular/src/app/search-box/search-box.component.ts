import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {} from '@angular/google-maps';

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
export class SearchBoxComponent implements OnInit, AfterViewInit {
  @Output()
  locationSelected: EventEmitter<any> = new EventEmitter();
  autocomplete: google.maps.places.Autocomplete | undefined;
  location!: Location;
  constructor() {}
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const inputField = document.getElementById(
      'search-box'
    ) as HTMLInputElement;
    this.autocomplete = new google.maps.places.Autocomplete(inputField);

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      if (place && place.geometry && place.geometry.location) {
        this.location = {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        };
      }
      this.locationSelected.emit(this.location);
    });
  }
}
