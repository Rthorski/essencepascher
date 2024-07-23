export interface Station {
  id: number;
  name: string;
  pop: string;
  town: string;
  adresse: string;
  latitude: number;
  longitude: number;
  gazole: {
    id: number;
    maj: Date;
    nom: string;
    valeur: number;
  };
  sp95: {
    id: number;
    maj: Date;
    nom: string;
    valeur: number;
  };
  e10: {
    id: number;
    maj: Date;
    nom: string;
    valeur: number;
  };
  sp98: {
    id: number;
    maj: Date;
    nom: string;
    valeur: number;
  };
  e85: {
    id: number;
    maj: Date;
    nom: string;
    valeur: number;
  };
  gplc: {
    id: number;
    maj: Date;
    nom: string;
    valeur: number;
  };
}
