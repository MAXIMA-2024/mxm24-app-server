import { z } from "zod";
import { idSchema } from "@/models/id.model";

const mahasiswaSchema = z.object({
  id: idSchema,
  name: z
    .string({ required_error: "Name cannot be empty" })
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  nim: z
    .string({ required_error: "NIM cannot be empty" })
    .length(11, "NIM must be 11 characters")
    .startsWith("00000", { message: "NIM must start with 00000/0" }),
  email: z
    .string({
      required_error: "Email cannot be empty",
    })
    .email("Email must be a valid email address")
    .endsWith(
      "@student.umn.ac.id",
      "Email must be a valid UMN student email address"
    ),
  angkatan: z
    .number({ required_error: "Angkatan cannot be empty" })
    .min(2024, "Only students from 2024 are allowed")
    .max(2024, "Only students from 2024 are allowed"),
  prodi: z
    .string({
      required_error: "Prodi cannot be empty",
    })
    .min(3, "Prodi must be at least 3 characters")
    .max(100, "Prodi must be at most 100 characters"),

  // personal
  whatsapp: z
    .string({ required_error: "WhatsApp number cannot be empty" })
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, "Invalid WhatsApp number"),
  lineId: z.string({ required_error: "Line ID cannot be empty" }),
  token: z
    .string({ required_error: "Token cannot be empty" })
    .startsWith("MXM24-", "Token must start with MXM24-"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const mahasiswaUpdatableSchema = mahasiswaSchema.pick({
  name: true,
  nim: true,
  email: true,
  angkatan: true,
  prodi: true,
  whatsapp: true,
  lineId: true,
});

export const tokenValidationSchema = z.object({
  token: z.string().startsWith("MXM24-"),
});

export type Mahasiswa = z.infer<typeof mahasiswaSchema>;
export type MahasiswaUpdatable = z.infer<typeof mahasiswaUpdatableSchema>;
export type TokenValidation = z.infer<typeof tokenValidationSchema>;
