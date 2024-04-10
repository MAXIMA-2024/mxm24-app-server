import { z } from "zod";
import { idSchema } from "@/models/id.model";

export const daySchema = z.object({
  id: idSchema,
  code: z
    .string({ required_error: "Day code cannot be empty" })
    .length(3, "Day code must be 3 characters")
    .startsWith("D", "Day code must start with D"),
  date: z.date(),
});

export type Day = z.infer<typeof daySchema>;
