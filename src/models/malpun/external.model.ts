import { z } from "zod";
import { idSchema } from "../id.model";
import { validateAlfagiftId } from "./internal.model";

export const externalSchema = z.object({
  id: idSchema,
  code: z.string(),
  fullName: z.string({ required_error: "Fullname can't be empty" }),
  email: z
    .string({ required_error: "Email can't be empty" })
    .email("Please enter a valid email address"),
  transactionId: z.string(),

  // additional data
  alfagiftId: z
    .string()
    .length(16, "Invalid Alfagift ID length")
    .refine(validateAlfagiftId, "Invalid Alfagift ID")
    .optional(),

  isChatimeBundle: z
    .boolean({ required_error: "Chatime eligibility can't be empty" })
    .default(false),

  validatedAt: z.date(),
  attendance: z.boolean(),
  attendanceTime: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  turnstileToken: z.string(),
});

export const externalUpdatableSchema = externalSchema.pick({
  fullName: true,
  email: true,
  turnstileToken: true,
  alfagiftId: true,
  isChatimeBundle: true,
});

export const midtransCallbackSchema = z.object({
  transaction_status: z.string(),
  transaction_id: z.string(),
  order_id: z.string(),
  transaction_time: z.string(),
});

export type MidtransCallback = z.infer<typeof midtransCallbackSchema>;

export type MidtransStatus = {
  status_code: string;
  status_message: string;
  transaction_id: string;
  masked_card: string;
  order_id: string;
  payment_type: string;
  transaction_time: string;
  transaction_status:
    | "capture"
    | "settlement"
    | "pending"
    | "deny"
    | "cancel"
    | "expire";
  fraud_status: "accept" | "challenge" | "deny";
  approval_code: string;
  signature_key: string;
  bank: string;
  gross_amount: string;
  channel_response_code: string;
  channel_response_message: string;
  card_type: string;
  payment_option_type: string;
  shopeepay_reference_number: string;
  reference_id: string;
};
