import { RuntimeError } from "@akshay-na/exoframe/lib/common/RuntimeError";
import ProfileModel, { IProfile } from "../models/ProfileModel";
import { ProfileData } from "../types";
export class ProfileController {
  constructor() {}

  public async createProfile(profileData: ProfileData): Promise<IProfile> {
    try {
      const profile = Object.assign(profileData, {
        location: {
          type: "Point",
          coordinates: [profileData.location.lon, profileData.location.lat],
        },
      });

      return await ProfileModel.create(profile);
    } catch (error) {
      console.error(error);
      throw new RuntimeError("UNKNOWN_ERROR", { error });
    }
  }

  public async findById(profileId: string): Promise<IProfile | null> {
    return ProfileModel.findOne({ id: profileId });
  }
}
