import { ObjectUtils } from "@akshay-na/exoframe/lib/common/ObjectUtils";
import { UUID } from "@akshay-na/exoframe/lib/common/UUID";
import { faker } from "@faker-js/faker";

import { INTEREST_POOL } from "../constants/Constants";
import { ProfileController } from "../controllers/ProfileController";
import { ProfileData } from "../types";
import { Result } from "./types";

export class ProfileEngine {
  private profileController: ProfileController;
  constructor() {
    this.profileController = new ProfileController();
  }

  public async createProfile(profileData: ProfileData): Promise<Result<any>> {
    const result = await this.profileController.createProfile(profileData);
    const profile = ObjectUtils.omit(result.toJSON(), "_id", "__v");

    return {
      ok: true,
      value: profile,
    };
  }

  public async seedProfile(seed: number): Promise<Result<any>> {
    const profileCreated: any[] = [];
    for (let i = 0; i < seed; i++) {
      const profile = {
        id: UUID.randomUUID(),
        age: faker.number.int({ min: 18, max: 99 }),
        gender: faker.helpers.arrayElement(["M", "F", "Other"]),
        location: {
          lat: faker.location.latitude({ max: 90, min: -90 }),
          lon: faker.location.longitude({ max: 180, min: -180 }),
        },
        interests: faker.helpers.arrayElements(INTEREST_POOL, 5),
        details: {},
      };

      const result = await this.profileController.createProfile(profile);
      profileCreated.push(ObjectUtils.omit(result.toJSON(), "_id", "__v"));
    }

    return {
      ok: true,
      value: profileCreated,
    };
  }
}
