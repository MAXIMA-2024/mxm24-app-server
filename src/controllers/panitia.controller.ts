import type { Request, Response } from "express";
import {
  conflict,
  created,
  internalServerError,
  notFound,
  parseZodError,
  success,
  validationError,
} from "@/utils/responses";
import db from "@/services/db";
import {
  panitiaUpdatableSchema,
  type PanitiaUpdatable,
} from "@/models/accounts/panitia.model";
import logging from "@/utils/logging";
import { idSchema, type Id } from "@/models/id.model";

export const getAllPanitia = async (req: Request, res: Response) => {
  try {
    const panitia = await db.panitia.findMany({
      include: { divisi: true },
    });
    return success(res, "Berhasil mendapatkan data panitia", panitia);
  } catch (err) {
    logging("ERROR", "Error when trying to fetch all panitia data", err);
    return internalServerError(res);
  }
};

export const getPanitia = async (req: Request, res: Response) => {
  try {
    const validate = await idSchema.safeParseAsync(req.params.id);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const panitia = await db.panitia.findUnique({
      where: { id: validate.data },
      include: { divisi: true },
    });
    if (!panitia) {
      return notFound(
        res,
        `Data panitia dengan id ${validate.data} tidak ditemukan`
      );
    }
    return success(res, "Berhasil mendapatkan data panitia", panitia);
  } catch (err) {
    logging("ERROR", "Error when trying to fetch panitia data", err);
    return internalServerError(res);
  }
};

export const updatePanitia = async (req: Request, res: Response) => {
  try {
    const validateId = await idSchema.safeParseAsync(req.params.id);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }

    const validateData = await panitiaUpdatableSchema
      .partial()
      .safeParseAsync(req.body);
    if (!validateData.success) {
      return validationError(res, parseZodError(validateData.error));
    }

    const isExists = await db.panitia.findFirst({
      where: { id: validateId.data },
    });
    if (!isExists) {
      return notFound(
        res,
        `Data panitia dengan id ${validateId.data} tidak ditemukan`
      );
    }
    const panitia = await db.panitia.update({
      where: { id: validateId.data },
      data: validateData.data,
    });
    if (req.user?.role === "panitia") {
      logging(
        "LOGS",
        `Panitia dengan NIM ${req.user.data.nim} mengupdate data panitia dengan NIM ${panitia.nim}`,
        panitia
      );
    }
    return success(res, "Berhasil mengupdate data panitia", panitia);
  } catch (err) {
    logging("ERROR", "Error when trying to update panitia data", err);
    return internalServerError(res);
  }
};

export const deletePanitia = async (req: Request, res: Response) => {
  try {
    const validate = await idSchema.safeParseAsync(req.params.id);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const isExists = await db.panitia.findFirst({
      where: { id: validate.data },
    });
    if (!isExists) {
      return notFound(
        res,
        `Data panitia dengan id ${validate.data} tidak ditemukan`
      );
    }

    const panitia = await db.panitia.delete({
      where: { id: validate.data },
    });
    if (req.user?.role === "panitia") {
      logging(
        "LOGS",
        `Panitia dengan NIM ${req.user.data.nim} menghapus data panitia dengan NIM ${panitia.nim}`,
        panitia
      );
    }
    return success(
      res,
      `Data panitia dengan id ${validate.data} berhasil terhapus`
    );
  } catch (err) {
    logging("ERROR", "Error when trying to delete panitia data", err);
    return internalServerError(res);
  }
};

export const enumDivisiPanitia = async (req: Request, res: Response) => {
  try {
    const divisi = await db.divisiPanitia.findMany();
    return success(res, "Berhasil mendapatkan data divisi panitia", divisi);
  } catch (err) {
    logging("ERROR", "Error when trying to get divisi panitia enum data", err);
    return internalServerError(res);
  }
};
