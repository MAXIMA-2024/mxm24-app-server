import { z } from "zod";
import { idSchema } from "@/models/id.model";

export const verifikasiSchema = z.object({
  id: idSchema,
  role: z.enum(["panitia", "organisator"]),
});

export type Verifikasi = z.infer<typeof verifikasiSchema>;
