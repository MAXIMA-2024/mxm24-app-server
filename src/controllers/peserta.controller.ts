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
import logging from "@/utils/logging";
import { idSchema } from "@/models/id.model";
import {
  type MahasiswaUpdatable,
  mahasiswaUpdatableSchema,
} from "@/models/accounts/mahasiswa.model";

export const getAllMahasiswa = async (req: Request, res: Response) => {
  try {
    const peserta = await db.mahasiswa.findMany({
      select: {
        id: true,
        token: true,
        nim: true,
        name: true,
        StateRegistration: {
          select: {
            state: {
              select: {
                id: true,
                name: true,
              },
            },
            firstAttendance: true,
            lastAttendance: true,
          },
        },
      },
    });

    return success(res, "Berhasil mendapatkan data mahasiswa", peserta);
  } catch (err) {
    logging("ERROR", "Error when trying to fetch all peserta data", err);
    return internalServerError(res);
  }
};

export const getSingleMahasiswa = async (req: Request, res: Response) => {
  try {
    const validate = await idSchema.safeParseAsync(req.params.id);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const mahasiswa = await db.mahasiswa.findUnique({
      where: { id: validate.data },
      select: {
        id: true,
        token: true,
        nim: true,
        name: true,
        email: true,
        angkatan: true,
        lineId: true,
        whatsapp: true,
        prodi: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!mahasiswa) {
      return notFound(
        res,
        `Data mahasiswa dengan id ${validate.data} tidak ditemukan`
      );
    }

    return success(res, "Berhasil mendapatkan data mahasiswa", mahasiswa);
  } catch (err) {
    logging("ERROR", "Error when trying to update peserta data", err);
    return internalServerError(res);
  }
};

export const updateMahasiswa = async (
  req: Request<{ id: string }, MahasiswaUpdatable>,
  res: Response
) => {
  try {
    const validateId = await idSchema.safeParseAsync(req.params.id);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }

    const validateData = await mahasiswaUpdatableSchema
      .partial()
      .safeParseAsync(req.body);

    if (!validateData.success) {
      return validationError(res, parseZodError(validateData.error));
    }

    const isExists = await db.mahasiswa.findFirst({
      where: { id: validateId.data },
    });

    if (!isExists) {
      return notFound(
        res,
        `Data mahasiswa dengan id ${validateId.data} tidak ditemukan`
      );
    }

    const mahasiswa = await db.mahasiswa.update({
      where: { id: validateId.data },
      data: validateData.data,
    });

    if (req.user?.role === "panitia") {
      logging(
        "LOGS",
        `Panitia ${req.user.data.nim} mengupdate data mahasiswa ${isExists.nim}`
      );
    }

    return success(res, "Berhasil mengupdate data mahasiswa");
  } catch (err) {
    logging("ERROR", "Error when trying to update peserta data", err);
    return internalServerError(res);
  }
};

// dangerous endpoint, make sure frontend has confirmation modal
export const deleteMahasiswa = async (req: Request, res: Response) => {
  try {
    const validate = await idSchema.safeParseAsync(req.params.id);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const isExists = await db.mahasiswa.findFirst({
      where: { id: validate.data },
    });

    if (!isExists) {
      return notFound(
        res,
        `Data mahasiswa dengan id ${validate.data} tidak ditemukan`
      );
    }

    await db.mahasiswa.delete({ where: { id: validate.data } });

    if (req.user?.role === "panitia") {
      logging(
        "LOGS",
        `Panitia ${req.user.data.nim} menghapus data mahasiswa ${isExists.nim}`
      );
    }

    return success(res, "Berhasil menghapus data mahasiswa");
  } catch (err) {
    logging("ERROR", "Error when trying to delete peserta data", err);
    return internalServerError(res);
  }
};

// data malpun
export const getAllPesertaMalpun = async (req: Request, res: Response) => {
  try {
    const internal = await db.malpunInternal.findMany({
      select: {
        code: true,
        mahasiswa: {
          select: {
            id: true,
            nim: true,
            name: true,
          },
        },
        attendance: true,
        attendanceTime: true,
      },
    });

    const external = await db.malpunExternal.findMany({
      select: {
        id: true,
        code: true,
        fullName: true,
        attendance: true,
        attendanceTime: true,
      },
      where: {
        NOT: {
          transactionId: null,
          validatedAt: null,
        },
      },
    });

    // jelekkk tp mau gmn lagi
    const data = [
      ...internal.map((i) => ({
        id: i.mahasiswa.id,
        nim: i.mahasiswa.nim,
        name: i.mahasiswa.name,
        code: i.code,
        attendance: i.attendance,
        attendanceTime: i.attendanceTime,
        status: "internal",
      })),
      ...external.map((e) => ({
        id: e.id,
        code: e.code,
        name: e.fullName,
        attendance: e.attendance,
        attendanceTime: e.attendanceTime,
        status: "external",
      })),
    ];

    return success(res, "Berhasil mendapatkan data peserta malpun", data);
  } catch (err) {
    logging("ERROR", "Error when trying to fetch all peserta malpun data", err);
    return internalServerError(res);
  }
};
