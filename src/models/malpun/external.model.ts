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

export type MidtransCallback = {
  status_code: string;
  status_message: string;
  transaction_id: string;
  masked_card: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status: string;
  approval_code: string;
  bank: string;
  card_type: string;
};
