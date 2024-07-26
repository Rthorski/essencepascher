import { Routes } from '@angular/router';
import { ChartsListComponent } from './charts-list/charts-list.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
  { path: 'charts', component: ChartsListComponent },
  { path: '', component: MainComponent },
];
