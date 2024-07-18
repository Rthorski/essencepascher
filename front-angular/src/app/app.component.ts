import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { MainComponent } from './main/main.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, MainComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
