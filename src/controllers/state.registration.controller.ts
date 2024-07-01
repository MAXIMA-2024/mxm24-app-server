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
      return notFound(res, "Mahasiswa not found");
    }

    return success(
      res,
      "Successfully fetched state registration data",
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
      return notFound(res, "Mahasiswa not found");
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
      return notFound(res, "State not found");
    }

    // Max State Mahasiswa
    if (mahasiswa._count.StateRegistration >= 3) {
      return conflict(res, "Mahasiswa sudah mendaftar 3 state");
    }

    // Check Remaining Quota
    if (selectedState._count.StateRegistration >= selectedState.quota) {
      return conflict(res, "State sudah penuh");
    }
    // Check day ID
    const validateDayID = mahasiswa.StateRegistration.some(
      (state) => state.state.dayId === selectedState.dayId
    );
    if (validateDayID) {
      return conflict(
        res,
        "Mahasiswa sudah mendaftar state pada hari yang sama"
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
      `${mahasiswa.nim} menambahkan state ${selectedState.name}`,
      stateRegistration
    );
    return success(
      res,
      "Berhasil menambahkan State Mahasiswa",
      stateRegistration
    );
  } catch (err) {
    logging("ERROR", "Error when trying to fetch state registration data", err);
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
      return notFound(res, "Mahasiswa not found");
    }
    const isExists = await db.stateRegistration.findFirst({
      where: {
        stateId: validateStateId.data,
        mahasiswaId: mahasiswa.id,
      },
    });
    if (!isExists) {
      return notFound(res, "State Registration data not found");
    }
    const deleteStateRegistration = await db.stateRegistration.delete({
      where: {
        id: isExists.id,
      },
    });
    logging(
      "LOGS",
      `${mahasiswa.nim} menghapus state registration stateId: ${isExists.stateId}`,
      deleteStateRegistration
    );
    return success(
      res,
      "Berhasil menghapus state registration",
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
