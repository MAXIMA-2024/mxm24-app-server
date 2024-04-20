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

    const nimSender =
      req.user?.role === "panitia" ? req.user.data.nim : undefined;

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
        select: {
          nim: true,
          isVerified: true,
        },
      });

      if (updatedPanitia.isVerified) {
        logging(
          "LOGS",
          `Panitia with nim ${nimSender} verified the panitia with nim ${updatedPanitia.nim}`
        );

        return success(
          res,
          `Panitia with nim ${updatedPanitia.nim} verified successfully`
        );
      } else {
        logging(
          "LOGS",
          `Panitia with nim ${nimSender} unverified the panitia with nim ${updatedPanitia.nim}`
        );

        return success(
          res,
          `Panitia with nim ${updatedPanitia.nim} removed from verified list`
        );
      }
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
      select: {
        nim: true,
        isVerified: true,
      },
    });

    if (updatedOrganisator.isVerified) {
      logging(
        "LOGS",
        `Panitia with nim ${nimSender} verified the Organisator with nim ${updatedOrganisator.nim}`
      );

      return success(
        res,
        `Organisator with nim ${updatedOrganisator.nim} verified successfully`
      );
    } else {
      logging(
        "LOGS",
        `Panitia with nim ${nimSender} unverified the Organisator with nim ${updatedOrganisator.nim}`
      );

      return success(
        res,
        `Organisator with nim ${updatedOrganisator.nim} removed from verified list`
      );
    }
  } catch (err) {
    logging("ERROR", `Error trying to verify user`, err);
    return internalServerError(res);
  }
};
