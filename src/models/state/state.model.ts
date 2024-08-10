import { z } from "zod";
import { daySchema } from "@/models/state/day.model";
import { idSchema } from "@/models/id.model";

const maxWords = (max: number) => (value: string) => {
  return value.trim().split(/\s+/).length <= max;
};

export const stateSchema = z.object({
  id: idSchema,
  name: z.string({ required_error: "Name cannot be empty" }),
  day: daySchema,
  dayId: idSchema,
  logo: z.string({ required_error: "Logo cannot be empty" }),
  gallery: z.array(idSchema).optional(), // can be empty at first
  description: z
    .string({ required_error: "Description cannot be empty" })
    .refine(maxWords(150), {
      message: "Must have 150 words or fewer",
    }),
  location: z.string({ required_error: "Location cannot be empty" }),
  quota: z
    .number({ required_error: "Quota cannot be empty" })
    .min(1, "Quota must be at least 1"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const stateIdSchema = z.object({
  id: z.preprocess((v) => parseInt(v as string), z.number()),
});

export const stateUpdatableSchema = stateSchema.pick({
  name: true,
  dayId: true,
  description: true,
  location: true,
  quota: true,
});

export type stateUpdatableSchemaT = z.infer<typeof stateUpdatableSchema>;
export type stateIdSchemaT = z.infer<typeof stateIdSchema>;
