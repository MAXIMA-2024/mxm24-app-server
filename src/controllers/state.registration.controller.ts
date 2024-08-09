import type { Request, Response } from "express";
import {
  conflict,
  internalServerError,
  notFound,
  parseZodError,
  success,
  validationError,
} from "@/utils/responses";
import db from "@/services/db";
import logging from "@/utils/logging";
import { idSchema } from "@/models/id.model";

export const getStateRegistration = async (req: Request, res: Response) => {
  try {
    const stateRegistration = await db.mahasiswa.findUnique({
      where: { email: req.user?.data.email },
      include: {
        StateRegistration: {
          select: {
            id: true,
            state: {
              select: {
                id: true,
                logo: true,
                name: true,
              },
            },
            firstAttendance: true,
            lastAttendance: true,
          },
        },
        _count: {
          select: { StateRegistration: true },
        },
      },
    });
    if (!stateRegistration) {
      return notFound(res, "Mahasiswa tidak ditemukan");
    }

    return success(
      res,
      "Berhasil mengambil data STATE Registration",
      stateRegistration
    );
  } catch (err) {
    logging("ERROR", "Error when trying to fetch state registration data", err);
    return internalServerError(res);
  }
};

export const addStateRegistration = async (req: Request, res: Response) => {
  try {
    // Fetch Necessary Data
    // Mahasiswa
    const mahasiswa = await db.mahasiswa.findUnique({
      where: { email: req.user?.data.email },
      include: {
        StateRegistration: {
          include: {
            state: true,
          },
        },
        _count: {
          select: { StateRegistration: true },
        },
      },
    });
    if (!mahasiswa) {
      return notFound(res, "Data Mahasiswa tidak ditemukan");
    }

    // Selected State Data
    const selectedState = await db.state.findFirst({
      where: { id: req.body.stateId },

      include: {
        day: true,
        _count: {
          select: { StateRegistration: true },
        },
      },
    });
    if (!selectedState) {
      return notFound(res, "STATE tidak ditemukan");
    }

    // Max State Mahasiswa
    if (mahasiswa._count.StateRegistration >= 3) {
      return conflict(res, "Kamu telah mendaftar di 3 STATE");
    }

    // Check Remaining Quota
    if (selectedState._count.StateRegistration >= selectedState.quota) {
      return conflict(res, "STATE sudah penuh");
    }
    // Check day ID
    const validateDayID = mahasiswa.StateRegistration.some(
      (state) => state.state.dayId === selectedState.dayId
    );
    if (validateDayID) {
      return conflict(
        res,
        "Kamu telah mendaftar di STATE pada hari yang sama"
      );
    }

    // Create State Registration
    const stateRegistration = await db.stateRegistration.create({
      data: {
        mahasiswaId: mahasiswa.id,
        stateId: req.body.stateId,
      },
    });

    logging(
      "LOGS",
      `${mahasiswa.nim} menambahkan STATE ${selectedState.name}`,
      stateRegistration
    );
    return success(
      res,
      "Berhasil menambahkan STATE yang dipilih",
      stateRegistration
    );
  } catch (err) {
    logging("ERROR", "Error when trying to fetch STATE registration data", err);
    return internalServerError(res);
  }
};

export const deleteStateRegistration = async (req: Request, res: Response) => {
  try {
    const validateStateId = await idSchema.safeParseAsync(req.params.id);
    if (!validateStateId.success) {
      return validationError(res, parseZodError(validateStateId.error));
    }
    const mahasiswa = await db.mahasiswa.findUnique({
      where: { email: req.user?.data.email },
    });
    if (!mahasiswa) {
      return notFound(res, "Mahasiswa tidak ditemukan");
    }
    const isExists = await db.stateRegistration.findFirst({
      where: {
        stateId: validateStateId.data,
        mahasiswaId: mahasiswa.id,
      },
    });
    if (!isExists) {
      return notFound(res, "Data STATE Registration tidak ditemukan");
    }
    const deleteStateRegistration = await db.stateRegistration.delete({
      where: {
        id: isExists.id,
      },
    });
    logging(
      "LOGS",
      `${mahasiswa.nim} menghapus STATE registration, stateId: ${isExists.stateId}`,
      deleteStateRegistration
    );
    return success(
      res,
      "Berhasil menghapus data STATE registration",
      deleteStateRegistration
    );
  } catch (err) {
    logging(
      "ERROR",
      "Error when trying to delete state registration data",
      err
    );
    return internalServerError(res);
  }
};
