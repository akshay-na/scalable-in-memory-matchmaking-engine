import { LooseObject } from "@akshay-na/exoframe/lib/common/LooseObject";

export interface ProfileData {
  id: string;
  age: number;
  gender: string;
  location: {
    lat: number;
    lon: number;
  };
  interests: string[];
  details: LooseObject;
}
