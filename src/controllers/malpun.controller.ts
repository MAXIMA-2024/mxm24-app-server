import type { Request, Response } from "express";
import logging from "@/utils/logging";
import db from "@/services/db";
import {
  internalServerError,
  created,
  validationError,
  parseZodError,
} from "@/utils/responses";

import { nanoid } from "nanoid"; //generate random id

//model schema
import { externalUpdatableSchema } from "@/models/malpun/external.model";

//POST Method
//menambah account untuk pendaftaran malpun external
export const addAccountExternal = async (req: Request, res: Response) => {
  try {
    const validate = await externalUpdatableSchema.safeParseAsync(req.body);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }
    const account = await db.malpunExternal.create({
      data: {
        fullName: validate.data.fullName,
        email: validate.data.email,
        code: `MXM24-${nanoid(16)}`,
      },
    });
    return created(res, "Berhasil menambahkan account", account);
  } catch (err) {
    internalServerError(res);
  }
};
