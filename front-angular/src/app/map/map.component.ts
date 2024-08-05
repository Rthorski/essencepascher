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
  Popup,
} from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { StationsService } from '../stations.service';
import { FormsModule } from '@angular/forms';
import { ResultsComponent } from '../results/results.component';
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
  radius: number = 2;
  latitude!: number;
  longitude!: number;
  geolocateClicked = false;
  markers: any[] = [];
  apiKey: string = 'LyXVuu584biw12WAl9hG';
  specialMarker!: any;
  markerStationOver!: Marker | undefined;
  listFuels: any[] = [];
  fuelsSelectionned: any[] = [];
  allStations: any[] = [];
  stationsFiltered: any[] = [];

  constructor(private stationService: StationsService) {}

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    config.apiKey = 'LyXVuu584biw12WAl9hG';
  }

  ngAfterViewInit(): void {
    this.stationService
      .getAllStations()
      .subscribe((stations) => (this.allStations = stations));

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
      if (this.specialMarker) {
        this.specialMarker.remove();
        this.specialMarker = undefined;
      }

      const { latitude, longitude } = event.coords;
      this.latitude = latitude;
      this.longitude = longitude;
      this.removeClusterLayer();
      this.loadNearbyStations(latitude, longitude, this.radius);
      this.geolocateClicked = true;
    });

    this.map.on('load', () => {
      this.addClusterLayer();
    });
  }

  private addClusterLayer(): void {
    this.map!.addSource('stations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.allStations.map((station) => ({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [
              station.geolocalisation[0].longitude,
              station.geolocalisation[0].latitude,
            ],
          },
        })),
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    this.map!.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'stations',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1',
        ],
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
      },
    });

    this.map!.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'stations',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
    });

    this.map!.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'stations',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
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
    const coordinates = this.stations.map((station) => [
      station.geolocalisation[0].longitude,
      station.geolocalisation[0].latitude,
    ]);
    if (this.specialMarker) {
      const specialMarkerCoordinates = this.specialMarker.getLngLat();
      coordinates.push([
        specialMarkerCoordinates.lng,
        specialMarkerCoordinates.lat,
      ]);
    }

    if (coordinates.length > 0) {
      const bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord as [number, number]);
      }, new LngLatBounds(
        coordinates[0] as [number, number],
        coordinates[0] as [number, number]
      ));

      this.map?.fitBounds(bounds, { padding: 80, duration: 1500 });
      if (this.stations.length < 1) {
        alert('Aucune station-essence trouvée, veuillez augmenter le rayon');
      }
    }
  }

  onRadiusChange() {
    this.loadNearbyStations(this.latitude, this.longitude, this.radius);
  }

  changeFilter(event, fuel: string) {
    if (this.fuelsSelectionned.includes(fuel) && !event.target.checked) {
      this.fuelsSelectionned = this.fuelsSelectionned.filter(
        (fuelSelected) => fuelSelected != fuel
      );
    } else if (!this.fuelsSelectionned.includes(fuel) && event.target.checked) {
      this.fuelsSelectionned = [...this.fuelsSelectionned, fuel];
    }
  }

  onFuelSelection(event: any) {
    this.listFuels = event;
    this.fuelsSelectionned = this.listFuels.map((fuel) => fuel.key);
  }

  onDataChange(event: any) {
    const { latitude, longitude } = event;
    this.latitude = latitude;
    this.longitude = longitude;
    this.removeClusterLayer();
    this.loadNearbyStations(latitude, longitude, this.radius);
    this.addSearchedAdressMarker(latitude, longitude);
    this.geolocateClicked = true;
  }

  onStationOver(event: any) {
    const { lat, lon } = event;
    this.markers.forEach((marker) => {
      marker.remove();
      this.markerStationOver?.remove();
      this.markerStationOver = new Marker();
      this.markerStationOver?.setLngLat([lon, lat]).addTo(this.map!);
    });
  }

  onStationsFiltered(event: any[]) {
    this.stationsFiltered = event;
    this.markers.forEach((marker) => {
      marker.remove();
    });
    this.markers = [];
    this.stationsFiltered.forEach((station) => {
      const marker = new Marker()
        .setLngLat([station.longitude, station.latitude])
        .addTo(this.map!);
      this.markers.push(marker);
    });
  }

  onStationOut(event: any) {
    this.markerStationOver?.remove();
    this.markers.forEach((marker) => {
      marker.addTo(this.map!);
    });
  }

  addSearchedAdressMarker(latitude: number, longitude: number): void {
    if (this.specialMarker) {
      this.specialMarker.remove();
      this.specialMarker = undefined;
    }

    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage =
      'url(location_on_40dp_5F6368_FILL0_wght400_GRAD0_opsz40.svg)';
    el.style.width = '40px';
    el.style.height = '40px';

    this.specialMarker = new Marker({ element: el })
      .setLngLat([longitude, latitude])
      .addTo(this.map!);
  }

  removeClusterLayer(): void {
    if (this.map!.getLayer('clusters')) {
      this.map!.removeLayer('clusters');
    }
    if (this.map!.getLayer('cluster-count')) {
      this.map!.removeLayer('cluster-count');
    }
    if (this.map!.getLayer('unclustered-point')) {
      this.map!.removeLayer('unclustered-point');
    }
    if (this.map!.getSource('stations')) {
      this.map!.removeSource('stations');
    }
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
