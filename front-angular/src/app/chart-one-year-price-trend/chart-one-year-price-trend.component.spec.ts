import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartOneYearPriceTrendComponent } from './chart-one-year-price-trend.component';
import { Chart } from 'chart.js';

jest.mock('chart.js');

describe('ChartOneYearPriceTrendComponent', () => {
  let component: ChartOneYearPriceTrendComponent;
  let fixture: ComponentFixture<ChartOneYearPriceTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartOneYearPriceTrendComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartOneYearPriceTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call createChart on martOneYear change', () => {
    const createChartSpy = jest.spyOn(component, 'createChart');
    component.ngOnChanges({
      martOneYear: {
        currentValue: [],
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(createChartSpy).toHaveBeenCalledWith([], component.title);
  });

  it('should create a new Chart instance', () => {
    expect(Chart).toHaveBeenCalled();
  });
});
