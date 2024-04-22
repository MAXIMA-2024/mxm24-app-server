import { z } from "zod";

export const ssoSchema = z.object({
  ticket: z
    .string({ required_error: "SSO ticket is required" })
    .regex(/^ST-(0|[1-9]\d*)-(.+)-sso\.umn\.ac\.id$/, "Invalid SSO ticket"),
  issuer: z
    .string({ required_error: "Issuer URL is required" })
    .url("Invalid issuer URL"),
});

const CASSuccesModel = z.object({
  "cas:authenticationSuccess": z.object({
    "cas:user": z.string().email(),
    "cas:attributes": z.object({
      "cas:longTermAuthenticationRequestTokenUsed": z.string(),
      "cas:isFromNewLogin": z.string(),
      "cas:authenticationDate": z.string(),
      "cas:authenticationMethod": z.string(),
      "cas:successfulAuthenticationHandlers": z.string(),
    }),
  }),
});

const CASErrorModel = z.object({
  "cas:authenticationFailure": z.string(),
});

const CASModel = z.object({
  "cas:serviceResponse": z.union([CASSuccesModel, CASErrorModel]),
});

export type SSOModel = z.infer<typeof ssoSchema>;
export type CASModel = z.infer<typeof CASModel>;
