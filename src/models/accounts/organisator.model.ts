import { z } from "zod";
import { idSchema } from "@/models/id.model";
import { stateSchema } from "@/models/state/state.model";

const organisatorSchema = z.object({
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
  state: stateSchema,
  stateId: idSchema,
  isVerified: z.boolean({ required_error: "isVerified cannot be empty" }),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const organisatorUpdatableSchema = organisatorSchema.pick({
  name: true,
  nim: true,
  stateId: true,
  isVerified: true,
});

export type Organisator = z.infer<typeof organisatorSchema>;
export type OrganisatorUpdatable = z.infer<typeof organisatorUpdatableSchema>;
