import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBoxComponent } from './search-box.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

describe('SearchBoxComponent', () => {
  let component: SearchBoxComponent;
  let fixture: ComponentFixture<SearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SearchBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle prediction selection', () => {
    const prediction = { place_id: '12803', description: 'description' };
    const placeDetails = { geometry: { location: { lat: 'lat', lng: 'lng' } } };
    const httpGetSpy = jest
      .spyOn(TestBed.inject(HttpClient), 'get')
      .mockReturnValue(of(placeDetails));
    const locationSelectedEmitSpy = jest.spyOn(
      component.locationSelected,
      'emit'
    );
    const inputResetRequestedEmitSpy = jest.spyOn(
      component.inputResetRequested,
      'emit'
    );

    component.onPredictionSelected(prediction);

    expect(httpGetSpy).toHaveBeenCalledWith(
      `http://localhost:3000/api/place-details?place_id=${prediction.place_id}`
    );
    expect(locationSelectedEmitSpy).toHaveBeenCalledWith({
      latitude: 'lat',
      longitude: 'lng',
    });
    expect(inputResetRequestedEmitSpy).toHaveBeenCalled();
  });

  it('should handle empty API response', () => {
    const prediction = { place_id: '12803', description: 'description' };
    const emptyResponse = {}; // Simuler une réponse vide de l'API
    const httpGetSpy = jest
      .spyOn(TestBed.inject(HttpClient), 'get')
      .mockReturnValueOnce(of(emptyResponse));
    const locationSelectedEmitSpy = jest.spyOn(
      component.locationSelected,
      'emit'
    );
    const inputResetRequestedEmitSpy = jest.spyOn(
      component.inputResetRequested,
      'emit'
    );

    component.onPredictionSelected(prediction);

    expect(locationSelectedEmitSpy).not.toHaveBeenCalled();
    expect(inputResetRequestedEmitSpy).not.toHaveBeenCalled();
  });
});
