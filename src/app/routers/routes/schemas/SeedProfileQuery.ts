import { z } from "@akshay-na/exoframe/lib/zod/ZodUtils";

export const Seed = z.number().max(1000);
