import {
  ArgumentMapping,
  Configuration,
  Discoverable,
  Endpoint,
  ErrorMapping,
  Route,
  RouteDescription,
} from "@akshay-na/exoframe/lib/decorators/Route";
import { ZodUtils } from "@akshay-na/exoframe/lib/zod/ZodUtils";
import { ProfileEngine } from "../../engines/ProfileEngine";
import { ProfileData } from "../../types";
import { createProfileSchema } from "./schemas/CreateProfileBody";
import { Seed } from "./schemas/SeedProfileQuery";

@Route("/api/v1/profile")
@RouteDescription("Route to create a profile record/")
@Discoverable("demo:spark")
export class ProfilesRoute {
  @Endpoint("POST")
  @Configuration({ access: "PUBLIC", auth: "NONE" })
  @ArgumentMapping(["$body"])
  @ErrorMapping({ VALIDATION_FAILED: 400 })
  public async createProfile(profileData: ProfileData): Promise<any> {
    try {
      const profileEngine = new ProfileEngine();
      ZodUtils.parse(createProfileSchema, profileData);
      const result = await profileEngine.createProfile(profileData);
      return result.value;
    } catch (error: any) {
      console.error(error);
      switch (error.id) {
        default:
          throw error;
      }
    }
  }

  @Endpoint("PUT")
  @Configuration({ access: "PUBLIC", auth: "NONE" })
  @ArgumentMapping([{ $query: "seed" }])
  @ErrorMapping({ VALIDATION_FAILED: 400 })
  public async seedProfile(
    seed: number
  ): Promise<{ total: number; value: any }> {
    try {
      const profileEngine = new ProfileEngine();
      ZodUtils.parse(Seed, Number(seed));
      const result = await profileEngine.seedProfile(seed);
      return { total: result.value.length, value: result.value };
    } catch (error: any) {
      console.error(error);
      switch (error.id) {
        default:
          throw error;
      }
    }
  }
}
