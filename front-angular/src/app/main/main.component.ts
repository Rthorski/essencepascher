import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [MapComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {}
