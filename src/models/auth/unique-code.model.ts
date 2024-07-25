import { z } from "zod";

export const uniqueCodeSchema = z.object({
  uniqueCode: z
    .string({ required_error: "Unique code is required" })
    .length(6, { message: "Unique code must be 6 characters long" }),
  turnstileToken: z.string({ required_error: "Turnstile token is required" }),
});

export type UniqueCode = z.infer<typeof uniqueCodeSchema>;
