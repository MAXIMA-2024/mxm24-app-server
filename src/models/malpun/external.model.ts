import { z } from "zod";
import { idSchema } from "../id.model";

export const externalSchema = z.object({
  id: idSchema,
  code: z.string(),
  fullName: z.string({ required_error: "Fullname can't be empty" }),
  email: z
    .string({ required_error: "Email can't be empty" })
    .email("Please enter a valid email address"),
  transactionId: z.string(),
  validatedAt: z.date(),
  attendance: z.boolean(),
  attendanceTime: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const externalUpdatableSchema = externalSchema.pick({
  fullName: true,
  email: true,
});
