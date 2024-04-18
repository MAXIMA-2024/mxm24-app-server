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
import { idSchema } from "@/models/id.model";
import { verifikasiSchema } from "@/models/verifikasi.model";

export const verifikasiPanitia = async (req: Request, res: Response) => {
  try {
    const validateId = await idSchema.safeParseAsync(req.params.id);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }
    const validateBody = await verifikasiSchema.safeParseAsync(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const panitia = await db.panitia.findUnique({
      where: {
        id: validateId.data,
      },
    });

    if (!panitia) {
      logging("ERROR", `Panitia not found with id ${req.params.id}`);
      return notFound(res, `Panitia with id ${req.params.id} did not exist`);
    }

    const updatedPanitia = await db.panitia.update({
      where: {
        id: validateId.data,
      },
      data: {
        isVerified: !panitia.isVerified,
      },
    });

    return success(
      res,
      `Panitia with id ${req.params.id} verified successfully`,
      updatedPanitia
    );
  } catch (err) {
    logging(
      "ERROR",
      `Error trying to verified Panitia with id ${req.params.id}`,
      err
    );
    return internalServerError(res);
  }
};

export const verifikasiOrganisator = async (req: Request, res: Response) => {
  try {
    const validateId = await idSchema.safeParseAsync(req.params.id);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }
    const validateBody = await verifikasiSchema.safeParseAsync(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const organisator = await db.organisator.findUnique({
      where: {
        id: validateId.data,
      },
    });

    if (!organisator) {
      logging("ERROR", `Organisator not found with id ${req.params.id}`);
      return notFound(
        res,
        `Organisator with id ${req.params.id} did not exist`
      );
    }

    const updatedOrganisator = await db.organisator.update({
      where: {
        id: validateId.data,
      },
      data: {
        isVerified: !organisator.isVerified,
      },
    });

    return success(
      res,
      `Organisator with id ${req.params.id} verified successfully`,
      updatedOrganisator
    );
  } catch (err) {
    logging(
      "ERROR",
      `Error trying to verified Organisator with id ${req.params.id}`,
      err
    );
    return internalServerError(res);
  }
};
