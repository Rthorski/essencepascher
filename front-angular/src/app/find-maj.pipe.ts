import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findMaj',
  standalone: true,
})
export class FindMajPipe implements PipeTransform {
  transform(jsonPrix: any, fuelType: string): any {
    if (!jsonPrix.id) {
      return '';
    } else {
      const fuel_updated_at = jsonPrix.fuel_updated_at;
      const now = Date.now();
      const msBetweenNowMaj = now - new Date(fuel_updated_at).getTime();
      const milliTominutes = msBetweenNowMaj / 1000 / 60;
      if (milliTominutes < 60) {
        return `🕦 ${Math.round(milliTominutes)} minutes`;
      }
      if (milliTominutes < 1440) {
        return `🕦 ${Math.round(milliTominutes / 60)} ${
          Math.round(milliTominutes / 60) === 1 ? 'heure' : 'heures'
        }`;
      }
      if (milliTominutes < 10080) {
        return `🕦 ${Math.round(milliTominutes / 60 / 24)} ${
          Math.round(milliTominutes / 60 / 24) === 1 ? 'jour' : 'jours'
        }`;
      }
      return `🕦 ${Math.round(milliTominutes / 60 / 24 / 7)} ${
        Math.round(milliTominutes / 60 / 24 / 7) === 1 ? 'semaine' : 'semaines'
      }`;
    }
  }
}
