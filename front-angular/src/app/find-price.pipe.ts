import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findPrice',
  standalone: true,
})
export class FindPricePipe implements PipeTransform {
  transform(jsonPrix: any[], fuelType: string): any {
    const priceObject = jsonPrix.find((prix) => prix.nom === fuelType);
    return priceObject ? priceObject.valeur : '❌';
  }
}
