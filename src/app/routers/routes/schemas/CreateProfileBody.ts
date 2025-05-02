import { UUID } from "@akshay-na/exoframe/lib/common/UUID";
import { z } from "@akshay-na/exoframe/lib/zod/ZodUtils";

import { INTEREST_POOL } from "@/constants/Constants";

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const createProfileSchema = z.object({
  id: z.string().regex(UUID.PATTERN, "INVALID_UUID"),
  age: z.number().min(0),
  gender: z.enum(["M", "F", "Other"]),
  location: locationSchema,
  interests: z.array(z.enum(INTEREST_POOL)).max(5, {
    message: "You can select a maximum of 5 interests",
  }),
});

export type ProfileData = z.infer<typeof createProfileSchema>;
