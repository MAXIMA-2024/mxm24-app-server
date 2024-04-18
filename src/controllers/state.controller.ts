import type { Request, Response } from "express";
import {
  conflict,
  created,
  internalServerError,
  notFound,
  parseZodError,
  success,
  unauthorized,
  validationError,
} from "@/utils/responses";

import db from "@/services/db";

//day model
import { daySchema, type Day } from "@/models/state/day.model";

//state model
import {
  stateSchema,
  type stateUpdatableSchema,
  stateIdSchema,
} from "@/models/state/state.model";

//me-return semua hari acara state maxima
export const getAllDay = async (req: Request, res: Response) => {
  try {
    const days = await db.day.findMany();
    return success(res, "Berhasil mendapatkan semua hari state", days);
  } catch (err) {
    return internalServerError(res);
  }
};

//me-return semua state yang terdaftar dalam maxima
export const getAllState = async (req: Request, res: Response) => {
  try {
    const states = await db.state.findMany();
    return success(res, "Berhasil mendapatkan semua state", states);
  } catch (err) {
    return internalServerError(res);
  }
};

//me-return detail state berdasarkan id
export const showState = async (req: Request, res: Response) => {
  try {
    const validate = await stateIdSchema.safeParseAsync(req.params);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const state = await db.state.findUnique({
      where: { id: validate.data.id },
    });

    if (!state) {
      return notFound(
        res,
        `Data state dengan id ${validate.data.id} tidak ditemukan`
      );
    }

    return success(res, "Berhasil mendapatkan data state", state);
  } catch (err) {
    return internalServerError;
  }
};

//me-return daftar peserta yang terdaftar pada state sesuai id
export const showStatePeserta = async (req: Request, res: Response) => {
  res.send({ message: `daftar peserta pada state ${req.params.id}` });
};

//menambah state baru
export const addState = async (req: Request, res: Response) => {
  res.send({ message: `berhasil menambahkan state baru` });
};

//remove state sesuai id
export const removeState = async (req: Request, res: Response) => {
  res.send({ message: `berhasil menghapus state ${req.params.id}` });
};

//edit informasi pada state sesuai id
export const editState = async (req: Request, res: Response) => {
  res.send({ message: `mengedit state ${req.params.id}` });
};

//menambah logo state sesuai id
export const addStateLogo = async (req: Request, res: Response) => {
  res.send({ message: `menambahkan logo state ${req.params.id}` });
};

//menambah gallery pada state sesuai id
export const addStateGallery = async (req: Request, res: Response) => {
  res.send({ message: `menambahkan gallery state ${req.params.id}` });
};
