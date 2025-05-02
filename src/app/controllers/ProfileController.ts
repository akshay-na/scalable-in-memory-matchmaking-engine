import ProfileModel, { IProfile } from "../models/ProfileModel";
import { ProfileData } from "../types";
export class ProfileController {
  constructor() {}

  public async createProfile(profileData: ProfileData): Promise<IProfile> {
    return ProfileModel.create(profileData);
  }

  public async findById(profileId: string): Promise<IProfile | null> {
    return ProfileModel.findOne({ id: profileId });
  }
}
