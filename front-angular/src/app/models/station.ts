export interface Station {
  id: number;
  name: string;
  population: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  gazole: {
    id: number;
    fuel_updated_at: Date;
    name: string;
    value: number;
  };
  sp95: {
    id: number;
    fuel_updated_at: Date;
    name: string;
    value: number;
  };
  e10: {
    id: number;
    fuel_updated_at: Date;
    name: string;
    value: number;
  };
  sp98: {
    id: number;
    fuel_updated_at: Date;
    name: string;
    value: number;
  };
  e85: {
    id: number;
    fuel_updated_at: Date;
    name: string;
    value: number;
  };
  gplc: {
    id: number;
    fuel_updated_at: Date;
    name: string;
    value: number;
  };
}
