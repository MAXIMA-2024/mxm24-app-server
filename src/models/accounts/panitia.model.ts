import { z } from "zod";
import { divisiPanitiaSchema } from "@/models/divisiPanitia.model";
import { idSchema } from "@/models/id.model";

export const panitiaSchema = z.object({
  id: idSchema,
  name: z
    .string({ required_error: "Name cannot be empty" })
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  nim: z
    .string({ required_error: "NIM cannot be empty" })
    .length(11, "NIM must be 11 characters")
    .startsWith("00000", { message: "NIM must start with 00000/0" }),
  email: z
    .string({
      required_error: "Email cannot be empty",
    })
    .email("Email must be a valid email address")
    .endsWith(
      "@student.umn.ac.id",
      "Email must be a valid UMN student email address"
    ),
  divisi: divisiPanitiaSchema,
  divisiId: idSchema,
  isVerified: z.boolean({ required_error: "isVerified cannot be empty" }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const panitiaUpdatableSchema = panitiaSchema.pick({
  name: true,
  nim: true,
  divisiId: true,
  isVerified: true,
});

export type Panitia = z.infer<typeof panitiaSchema>;
export type PanitiaUpdatable = z.infer<typeof panitiaUpdatableSchema>;
