export interface Profile {
  id: string;
  age: number;
  gender: string;
  location: Location;
  interests: string[];
}

export interface Location {
  lat: number;
  lon: number;
}
