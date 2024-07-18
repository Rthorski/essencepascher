import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findMaj',
  standalone: true,
})
export class FindMajPipe implements PipeTransform {
  transform(jsonPrix: any[], fuelType: string): any {
    const priceObject = jsonPrix.find((prix) => prix.nom === fuelType);
    if (!priceObject) {
      return '';
    } else {
      const maj = priceObject.maj;
      const now = Date.now();
      const msBetweenNowMaj = now - new Date(maj).getTime();
      const milliTominutes = msBetweenNowMaj / 1000 / 60;
      if (milliTominutes < 60) {
        return `${Math.round(milliTominutes)} minutes`;
      }
      if (milliTominutes < 1440) {
        return `${Math.round(milliTominutes / 60)} ${
          Math.round(milliTominutes / 60) === 1 ? 'heure' : 'heures'
        }`;
      }
      if (milliTominutes < 10080) {
        return `${Math.round(milliTominutes / 60 / 24)} ${
          Math.round(milliTominutes / 60 / 24) === 1 ? 'jour' : 'jours'
        }`;
      }
      return `${Math.round(milliTominutes / 60 / 24 / 7)} ${
        Math.round(milliTominutes / 60 / 24 / 7) === 1 ? 'semaine' : 'semaines'
      }`;
    }
  }
}
