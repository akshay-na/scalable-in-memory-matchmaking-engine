import { ObjectUtils } from "@akshay-na/exoframe/lib/common/ObjectUtils";
import { RuntimeError } from "@akshay-na/exoframe/lib/common/RuntimeError";
import { UUID } from "@akshay-na/exoframe/lib/common/UUID";

import { faker } from "@faker-js/faker";

import { ProfileData } from "../app/types";
import { INTEREST_POOL, TEST_SEEDS } from "../constants/Constants";
import { ProfileController } from "../controllers/ProfileController";
import { MatchingEngine } from "./MatchingEngine";
import { Result } from "./types";

export class ProfileEngine {
  private profileController: ProfileController;
  private matchingEngine: MatchingEngine;

  constructor() {
    this.profileController = new ProfileController();
    this.matchingEngine = new MatchingEngine();
  }

  public async createProfile(profileData: ProfileData): Promise<Result<any>> {
    const result = await this.profileController.createProfile(profileData);
    const profile = ObjectUtils.omit(result.toJSON(), "_id", "__v");

    return {
      ok: true,
      value: profile,
    };
  }

  public async matchProfile(userId: string): Promise<Result<any>> {
    const profile = await this.profileController.findById(userId);

    if (!profile) throw new RuntimeError("PROFILE_NOT_FOUND", { userId });
    if (profile.age < 18)
      throw new RuntimeError("CANNOT_SERVE_MINOR", { profile });

    const matchedProfilesId = await this.matchingEngine.topMatches(profile);
    if (!matchedProfilesId || matchedProfilesId?.length === 0)
      throw new RuntimeError("NO_MATCH_FOUND", { userId });

    const matchedProfiles: any[] = [];

    for (const id of matchedProfilesId) {
      const match = await this.profileController.findById(id);
      matchedProfiles.push(match?.toJSON());
    }

    return {
      ok: true,
      value: matchedProfiles.map((e) => {
        return ObjectUtils.omit(e, "_id", "__v");
      }),
    };
  }

  private generateProfile(): any {
    return {
      id: UUID.randomUUID(),
      age: faker.number.int({ min: 18, max: 99 }),
      gender: faker.helpers.arrayElement(["M", "F", "Other"]),
      location: faker.helpers.arrayElement(TEST_SEEDS),
      interests: faker.helpers.arrayElements(INTEREST_POOL, 5),
      details: {},
    };
  }

  public async seedProfile(seed: number): Promise<Result<any>> {
    const profileCreated: any[] = [];

    for (let i = 0; i < seed; i++) {
      const profile = this.generateProfile();
      profileCreated.push(await this.profileController.createProfile(profile));
    }

    return {
      ok: true,
      value: profileCreated.map((e) => {
        return ObjectUtils.omit(e.toJSON(), "_id", "__v");
      }),
    };
  }
}
