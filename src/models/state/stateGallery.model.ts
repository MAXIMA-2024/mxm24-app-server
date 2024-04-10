import { z } from "zod";
import { idSchema } from "@/models/id.model";
import { stateSchema } from "@/models/state/state.model";

const stateGallerySchema = z.object({
  id: idSchema,
  url: z.string({ required_error: "Url cannot be empty" }),
  state: stateSchema,
  stateId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

const stateGalleryUpdatableSchema = stateGallerySchema.pick({
  url: true,
  stateId: true,
});

export type StateGallery = z.infer<typeof stateGallerySchema>;
export type StateGalleryUpdatable = z.infer<typeof stateGalleryUpdatableSchema>;
