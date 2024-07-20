import { z } from "zod";
import { idSchema } from "../id.model";
import { midtransCallback } from "@/controllers/malpun.controller";

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

export const midtransCallbackSchema = z.object({
  transaction_status: z.string(),
  transaction_id: z.string(),
  order_id: z.string(),
  transaction_time: z.string(),
});

export type MidtransCallback = z.infer<typeof midtransCallbackSchema>;
