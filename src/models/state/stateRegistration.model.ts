import { z } from "zod";
import { idSchema } from "@/models/id.model";
import { stateSchema } from "@/models/state/state.model";

export const stateRegistrationSchema = z.object({
  id: idSchema,
  state: stateSchema,
  stateId: idSchema,
  mahasiswa: z.string(),
  mahasiswaId: idSchema,

  // siapapun nanti yang handle absen nanti bantu rapihin validasi ya😭
  firstAttendance: z.boolean().optional().default(false),
  lastAttendance: z.boolean().optional().default(false),
  firstAttendanceTime: z.date().optional(),
  lastAttendanceTime: z.date().optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const stateRegistrationUpdatableSchema = stateRegistrationSchema.pick({
  stateId: true,
  mahasiswaId: true,
});

export type StateRegistration = z.infer<typeof stateRegistrationSchema>;
export type StateRegistrationUpdatable = z.infer<
  typeof stateRegistrationUpdatableSchema
>;
