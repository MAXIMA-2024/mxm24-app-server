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
import { tokenValidationSchema } from "@/models/accounts/mahasiswa.model";

// absen state
export const absenState = async (req: Request, res: Response) => {
  try {
    // Check if the token starts with "MXM24-"
    const validateToken = await tokenValidationSchema.safeParseAsync(req.body);
    if (!validateToken.success) {
      return validationError(res, parseZodError(validateToken.error));
    }

    const tokenMahasiswa = validateToken.data.token;

    const today = new Date();
    // Get the day using date todays date, ignore the tie
    const day = await db.day.findFirst({
      where: {
        date: today.getUTCDate(),
      },
    });

    if (!day) {
      const days = await db.day.findMany({});
      console.log(days);
      console.log(today);
      return notFound(res, `Tidak ada STATE yang aktif hari ini`);
    }

    //refactor fathan
    const mahasiswa = await db.mahasiswa.findFirst({
      where: { token: tokenMahasiswa },
      include: {
        StateRegistration: {
          include: { state: true },
        },
      },
    });

    if (!mahasiswa) {
      return notFound(res, `Token Invalid`);
    }

    const currentState = mahasiswa.StateRegistration.find(
      (state) => state.state.dayId === day.id
    );

    if (!currentState) {
      return notFound(
        res,
        `Mahasiswa tidak terdaftar pada STATE manapun di hari ini`
      );
    }

    const nimSender =
      req.user?.role === "panitia" ? req.user.data.nim : undefined;

    // record attendance
    if (currentState.firstAttendance && currentState.lastAttendance) {
      return validationError(
        res,
        `Both attendances have already been recorded`
      );
    }

    if (currentState.firstAttendance) {
      const update = await db.stateRegistration.update({
        where: {
          id: currentState.id,
        },
        data: {
          lastAttendance: true,
          lastAttendanceTime: new Date(),
        },
      });
      logging(
        "LOGS",
        `Panitia with nim ${nimSender} put the Last Attendance for student with nim ${mahasiswa.nim}`
      );
      return success(res, `Last attendance recorded successfully`);
    }

    const update = await db.stateRegistration.update({
      where: {
        id: currentState.id,
      },
      data: {
        firstAttendance: true,
        firstAttendanceTime: new Date(),
      },
    });
    logging(
      "LOGS",
      `Panitia with nim ${nimSender} put the First Attendance for student with nim ${mahasiswa.nim}`
    );
    return success(res, `First attendance recorded successfully`);
  } catch (err) {
    logging("ERROR", `Error trying to set attendance for student`, err);
    return internalServerError(res);
  }
};
