import { z } from "zod";
import { idSchema } from "@/models/id.model";

export const divisiPanitiaSchema = z.object({
  id: idSchema,
  name: z
    .string({ required_error: "Name cannot be empty" })
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
});

export type DivisiPanitia = z.infer<typeof divisiPanitiaSchema>;
