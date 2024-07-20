import { z } from "zod";
import { idSchema } from "@/models/id.model";

export const divisiPanitiaSchema = z.object({
  id: idSchema,
  name: z
    .string({ required_error: "Name cannot be empty" })
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
});

export type DivisiPanitiaUpdatable = z.infer<typeof divisiPanitiaSchema>;

export enum DivisiPanitia {
  NOVATOR = 1,
  CHARTA,
  ACTUS,
  SCRIPTUM,
  PIPOCA,
  VENUSTUS,
  PICTORIUM,
  PROVENTUS,
  INVICTUS,
  LIGATURA,
  MERCIMONIA,
  SCOPUS,
  EPISTULA,
  AUREUS,
  ASPECTUS,
}
