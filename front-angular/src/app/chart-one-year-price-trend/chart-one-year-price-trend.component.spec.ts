import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartOneYearPriceTrendComponent } from './chart-one-year-price-trend.component';

describe('ChartOneYearPriceTrendComponent', () => {
  let component: ChartOneYearPriceTrendComponent;
  let fixture: ComponentFixture<ChartOneYearPriceTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartOneYearPriceTrendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartOneYearPriceTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
