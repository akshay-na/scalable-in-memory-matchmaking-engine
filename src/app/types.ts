import { LooseObject } from "@akshay-na/exoframe/lib/common/LooseObject";

export type ProfileData = {
  id: string;
  age: number;
  gender: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  interests: string[];
  details: LooseObject;
};
