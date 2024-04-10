import { z } from "zod";

export const idSchema = z.preprocess(
  (val) => Number(val),
  z.number().int("Id must be integer").positive("Id must be positive"),
  { required_error: "Id is required" }
);

export type Id = z.infer<typeof idSchema>;
