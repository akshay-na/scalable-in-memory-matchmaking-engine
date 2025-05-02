import { UUID } from "@akshay-na/exoframe/lib/common/UUID";
import { z } from "@akshay-na/exoframe/lib/zod/ZodUtils";

export const ProfileId = z.string().regex(UUID.PATTERN, "INVALID_UUID");
