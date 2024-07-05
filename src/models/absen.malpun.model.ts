import z from "zod";

export const absenMalpunSchema = z.object({
    code: z.string({ required_error: "Code cannot be empty" })
        .startsWith("MXM24-", { message: "Code is Invalid" })
        .min(22, "Code is Invalid due to length")
});

export type absenMalpuns = z.infer<typeof absenMalpunSchema>;
