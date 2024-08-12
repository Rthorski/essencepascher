import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;

  beforeEach(() => {
    component = new HeaderComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a headers', () => {
    expect(component.headers).toEqual(['home', 'about', 'contact']);
  });
});
