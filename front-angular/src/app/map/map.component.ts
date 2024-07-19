import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {
  Map,
  MapStyle,
  config,
  Marker,
  GeolocateControl,
  LngLatBounds,
} from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { StationsService } from '../stations.service';
import { FormsModule } from '@angular/forms';
import { ResultsComponent } from '../results/results.component';
import maplibregl from 'maplibre-gl';
import { SearchBoxComponent } from '../search-box/search-box.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [FormsModule, ResultsComponent, SearchBoxComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map | undefined;
  stations!: any[];
  radius: number = 1;
  latitude!: number;
  longitude!: number;
  geolocateClicked = false;
  markers: any[] = [];
  apiKey: string = 'LyXVuu584biw12WAl9hG';

  constructor(private stationService: StationsService) {}

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    config.apiKey = 'LyXVuu584biw12WAl9hG';
  }

  ngAfterViewInit(): void {
    const initialState = { lng: 2.45, lat: 46.866667, zoom: 5 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: MapStyle.BASIC,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      geolocateControl: false,
      logoPosition: 'bottom-right',
    });

    const geolocate = new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: false,
    });

    this.map.addControl(geolocate);

    geolocate.on('geolocate', (event) => {
      console.log('oui');
      const { latitude, longitude } = event.coords;
      this.latitude = latitude;
      this.longitude = longitude;
      this.loadNearbyStations(latitude, longitude, this.radius);
      this.geolocateClicked = true;
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  addMarkerOnMap(): void {
    this.stations.forEach((station) => {
      const marker = new Marker()
        .setLngLat([
          station.geolocalisation[0].longitude,
          station.geolocalisation[0].latitude,
        ])
        .addTo(this.map!);
      this.markers.push(marker);
    });
  }

  fitMapToBounds(): void {
    if (this.stations.length > 0) {
      const bounds = new LngLatBounds();
      this.stations.forEach((station) => {
        bounds.extend([
          station.geolocalisation[0].longitude,
          station.geolocalisation[0].latitude,
        ]);
      });
      this.map?.fitBounds(bounds, { padding: 80, duration: 1500 });
    }
  }

  onRadiusChange() {
    this.loadNearbyStations(this.latitude, this.longitude, this.radius);
  }

  onDataChange(event: any) {
    const { latitude, longitude } = event;
    this.latitude = latitude;
    this.longitude = longitude;
    this.loadNearbyStations(latitude, longitude, this.radius);
    this.geolocateClicked = true;
  }

  loadNearbyStations(
    latitude: number,
    longitude: number,
    radius: number
  ): void {
    this.markers.forEach((marker) => {
      marker.remove();
    });
    this.markers = [];
    const radiusToMeters = radius * 1000;
    this.stationService
      .getNearbyStations(latitude, longitude, radiusToMeters)
      .subscribe((stations) => {
        this.stations = stations;
        this.stationService.updateStations(stations);
        this.addMarkerOnMap();
        this.fitMapToBounds();
      });
  }
}
