import type { Request, Response } from "express";
import logging from "@/utils/logging";
import db from "@/services/db";
import {
  internalServerError,
  success,
  notFound,
  validationError,
  parseZodError,
} from "@/utils/responses";
import { verifikasiSchema, type Verifikasi } from "@/models/verifikasi.model";

export const verifikasi = async (
  req: Request<{}, {}, Verifikasi>,
  res: Response
) => {
  try {
    const validateBody = await verifikasiSchema.safeParseAsync(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    if (req.body.role === "panitia") {
      const panitia = await db.panitia.findUnique({
        where: {
          id: validateBody.data.id,
        },
      });

      if (!panitia) {
        logging("ERROR", `Panitia not found with id ${validateBody.data.id}`);
        return notFound(
          res,
          `Panitia with id ${validateBody.data.id} did not exist`
        );
      }

      const updatedPanitia = await db.panitia.update({
        where: {
          id: validateBody.data.id,
        },
        data: {
          isVerified: !panitia.isVerified,
        },
      });

      return success(
        res,
        `Panitia with id ${validateBody.data.id} verified successfully`
      );
    }

    const organisator = await db.organisator.findUnique({
      where: {
        id: validateBody.data.id,
      },
    });

    if (!organisator) {
      logging("ERROR", `Organisator not found with id ${validateBody.data.id}`);
      return notFound(
        res,
        `Organisator with id ${validateBody.data.id} did not exist`
      );
    }

    const updatedOrganisator = await db.organisator.update({
      where: {
        id: validateBody.data.id,
      },
      data: {
        isVerified: !organisator.isVerified,
      },
    });

    return success(
      res,
      `Organisator with id ${validateBody.data.id} verified successfully`
    );
  } catch (err) {
    logging("ERROR", `Error trying to verify user`, err);
    return internalServerError(res);
  }
};
