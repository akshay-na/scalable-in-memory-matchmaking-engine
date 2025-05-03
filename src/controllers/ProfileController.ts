import { RuntimeError } from "@akshay-na/exoframe/lib/common/RuntimeError";
import { ProfileData } from "../app/types";
import ProfileModel, { IProfile } from "../models/ProfileModel";
import { MatchPrecomputeWorker } from "../worker/MatchPrecomputeWorker";
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

      const record = await ProfileModel.create(profile);

      const worker = MatchPrecomputeWorker.getInstance();
      await worker.queue.add("new-profile", record);

      return record;
    } catch (error) {
      console.error(error);
      throw new RuntimeError("UNKNOWN_ERROR", { error });
    }
  }

  public async findById(profileId: string): Promise<IProfile | null> {
    return ProfileModel.findOne({ id: profileId });
  }

  public async findMatchingLocation(
    profile: IProfile
  ): Promise<IProfile[] | undefined> {
    return ProfileModel.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: profile.location.coordinates },
          distanceField: "distKm",
          maxDistance: 50 * 1000,
          distanceMultiplier: 0.001,
          spherical: true,
        },
      },
      {
        $match: {
          age: { $gte: profile.age - 10, $lte: profile.age + 10 },
          gender: { $ne: profile.gender },
          id: { $ne: profile.id },
        },
      },
    ]);
  }
}
