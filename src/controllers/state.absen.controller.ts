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
import type { Day } from "@prisma/client";

// absen state
export const absenState = async (req: Request, res: Response) => {
  try {
    const validateToken = await tokenValidationSchema.safeParseAsync(req.body);
    if (!validateToken.success) {
      return validationError(res, parseZodError(validateToken.error));
    }

    const token = validateToken.data.token;

    // get the latest day according to now
    // const day = await db.day.findFirst({
    //   where: {
    //     date: start,
    //   },
    // });

    const now = new Date();

    const dayCandidate = (await db.$queryRaw`
      SELECT * 
      FROM Day
      WHERE DATE_FORMAT(date, '%m') = ${now.getMonth() + 1}
      AND DATE_FORMAT(date, '%d') = ${now.getDate()}
      LIMIT 1
    `) as Day[];

    if (!dayCandidate.length) {
      return notFound(res, `Tidak ada STATE yang sedang berlangsung sekarang`);
    }

    const day = dayCandidate[0];
    // check if time already passed
    const dbDate = new Date(day.date);

    if (now < dbDate) {
      return notFound(res, `STATE pada ${day.code} belum dimulai`);
    }

    const stateReg = await db.stateRegistration.findFirst({
      where: {
        mahasiswa: {
          token,
        },
        state: {
          dayId: day.id,
        },
      },
      include: {
        mahasiswa: {
          select: {
            nim: true,
            name: true,
          },
        },
      },
    });

    if (!stateReg) {
      return notFound(
        res,
        `Mahasiswa tidak terdaftar pada STATE manapun di hari ini`
      );
    }

    const nimSender =
      req.user?.role === "panitia" ? req.user.data.nim : undefined;

    if (stateReg.firstAttendance && stateReg.lastAttendance) {
      return validationError(
        res,
        `Kedua absen sudah tercatat untuk ${stateReg.mahasiswa.nim} - ${stateReg.mahasiswa.name}`
      );
    }

    if (stateReg.firstAttendance) {
      await db.stateRegistration.update({
        where: {
          id: stateReg.id,
        },
        data: {
          lastAttendance: true,
          lastAttendanceTime: now,
        },
      });
      logging(
        "LOGS",
        `Panitia dengan nim ${nimSender} melakukan absen terakhir untuk mahasiswa dengan nim ${stateReg.mahasiswa.nim}`
      );
      return success(
        res,
        `Absen terakhir berhasil dicatat untuk ${stateReg.mahasiswa.nim} - ${stateReg.mahasiswa.name}`
      );
    }

    await db.stateRegistration.update({
      where: {
        id: stateReg.id,
      },
      data: {
        firstAttendance: true,
        firstAttendanceTime: now,
      },
    });

    logging(
      "LOGS",
      `Panitia dengan nim ${nimSender} melakukan absen pertama untuk mahasiswa dengan nim ${stateReg.mahasiswa.nim}`
    );
    return success(
      res,
      `Absen pertama berhasil dicatat untuk ${stateReg.mahasiswa.nim} - ${stateReg.mahasiswa.name}`
    );
  } catch (err) {
    logging("ERROR", `Error trying to set attendance for student`, err);
    return internalServerError(res);
  }
};

// lupa kalo fe harus liat detail dlu baru put absen
export const absenStateDetail = async (req: Request, res: Response) => {
  try {
    const validateToken = await tokenValidationSchema.safeParseAsync(
      req.params
    );
    if (!validateToken.success) {
      return validationError(res, parseZodError(validateToken.error));
    }

    const token = validateToken.data.token;

    const now = new Date();

    const dayCandidate = (await db.$queryRaw`
      SELECT * 
      FROM Day
      WHERE DATE_FORMAT(date, '%m') = ${now.getMonth() + 1}
      AND DATE_FORMAT(date, '%d') = ${now.getDate()}
      LIMIT 1
    `) as Day[];

    if (!dayCandidate.length) {
      return notFound(res, `Tidak ada STATE yang sedang berlangsung sekarang`);
    }

    const day = dayCandidate[0];
    // check if time already passed
    const dbDate = new Date(day.date);

    if (now < dbDate) {
      return notFound(res, `STATE pada ${day.code} belum dimulai`);
    }

    const stateReg = await db.stateRegistration.findFirst({
      where: {
        mahasiswa: {
          token,
        },
        state: {
          dayId: day.id,
        },
      },
      include: {
        mahasiswa: {
          select: {
            nim: true,
            name: true,
          },
        },
        state: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!stateReg) {
      return notFound(
        res,
        `Mahasiswa tidak terdaftar pada STATE manapun di hari ini`
      );
    }

    return success(res, `Data absen mahasiswa`, stateReg);
  } catch (err) {
    logging("ERROR", `Error trying to set attendance for student`, err);
    return internalServerError(res);
  }
};
