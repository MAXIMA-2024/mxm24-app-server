import { z } from "zod";
import { idSchema } from "@/models/id.model";

export const toggleSchema = z.object({
  id: idSchema,
  name: z
    .string({ required_error: "Name cannot be empty" })
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  toggle: z.boolean({
    required_error: "Toggle cannot be empty",
    invalid_type_error: "Toggle must be a boolean",
  }),
});

export type Toggle = z.infer<typeof toggleSchema>;
