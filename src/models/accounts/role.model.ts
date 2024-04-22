import { z } from "zod";

export const roleSchema = z.enum(["panitia", "organisator", "mahasiswa"], {
  required_error: "Role cannot be empty",
  invalid_type_error:
    "Role must be one of 'panitia', 'organisator', or 'mahasiswa'",
});

export type Role = z.infer<typeof roleSchema>;
