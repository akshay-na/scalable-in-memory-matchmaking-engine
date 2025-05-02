import { ObjectUtils } from "@akshay-na/exoframe/lib/common/ObjectUtils";

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
}
