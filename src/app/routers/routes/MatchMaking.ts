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
import { ProfileEngine } from "../../../engines/ProfileEngine";
import { ProfileId } from "./schemas/MatchMakingParam";

@Route("/api/v1/match/:id")
@RouteDescription("Route to create a profile record/")
@Discoverable("demo:spark")
export class MatchMaking {
  @Endpoint("GET")
  @Configuration({ access: "PUBLIC", auth: "NONE" })
  @ArgumentMapping([{ $param: "id" }])
  @ErrorMapping({ VALIDATION_FAILED: 400, PROFILE_NOT_FOUND: 404 })
  public async matchProfile(
    id: string
  ): Promise<{ totalMatches: number; value: any }> {
    try {
      const profileEngine = new ProfileEngine();
      ZodUtils.parse(ProfileId, id);
      const result = await profileEngine.matchProfile(id);
      return { totalMatches: result.value.length, value: result.value };
    } catch (error: any) {
      console.error(error);
      switch (error.id) {
        default:
          throw error;
      }
    }
  }
}
