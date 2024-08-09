import { z } from "zod";
import { idSchema } from "../id.model";

export const validateAlfagiftId = (code: string) =>
  code.startsWith("999001") || code.startsWith("999999");

export const internalSchema = z.object({
  id: idSchema,
  code: z
    .string({ required_error: "Code can't be empty" })
    .length(22, "Invalid code length")
    .startsWith("MXM24-", { message: "Code must start with MXM24-" }),
  mahasiswaId: idSchema,
  attendance: z.boolean({ required_error: "Attendance can't be empty" }),
  attendanceTime: z.date(),
  alfagiftId: z
    .string()
    .length(16, "Invalid Alfagift ID length")
    .refine(validateAlfagiftId, (_val) => ({ message: "Invalid Alfagift ID" })),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const codeValidationSchema = internalSchema.pick({
  code: true,
});

export const internalUpdatableSchema = internalSchema.pick({
  alfagiftId: true,
});

export type Internal = z.infer<typeof internalSchema>;
export type InternalUpdatable = z.infer<typeof internalUpdatableSchema>;
