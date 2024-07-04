import { z } from "zod";
import { idSchema } from "../id.model";
import { created } from "@/utils/responses";
// import { mahasiswaSchema } from "../accounts/mahasiswa.model";


export const internalSchema = z.object({
    id: idSchema,
    code: z
    .string({ required_error: "Code can't be empty" })
    .startsWith("MXM24-", { message: "Code must start with MXM24-"}),
    mahasiswaId: idSchema,
    attendance: z.boolean({ required_error: "Attendance can't be empty"}),
    attendanceTime: z.date(),
    alfagiftId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const internalUpdatableSchema = internalSchema.pick({
    alfagiftId: true,
});
export const codeValidationSchema = internalSchema.pick({
    code: true,
});


export type Internal = z.infer<typeof internalSchema>;
export type InternalUpdatable = z.infer<typeof internalUpdatableSchema>;

