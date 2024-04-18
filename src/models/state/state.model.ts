import { z } from "zod";
import { daySchema } from "@/models/state/day.model";
import { idSchema } from "@/models/id.model";

export const stateSchema = z.object({
  id: idSchema,
  name: z.string({ required_error: "Name cannot be empty" }),
  day: daySchema,
  dayId: idSchema,
  logo: z.string({ required_error: "Logo cannot be empty" }),
  gallery: z.array(idSchema).optional(), // can be empty at first
  description: z
    .string({ required_error: "Description cannot be empty" })
    .max(500, "Description must be under 500 characters"),
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
  logo: true,
  gallery: true,
  description: true,
  location: true,
  quota: true,
});
