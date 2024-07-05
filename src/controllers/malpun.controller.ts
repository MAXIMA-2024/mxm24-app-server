import type { Request, Response } from "express";
import logging from "@/utils/logging";
import db from "@/services/db";
import {
  internalServerError,
  success,
  notFound,
  validationError,
  parseZodError,
  forbidden,
} from "@/utils/responses";

import { absenMalpunSchema, type AbsenMalpun } from "@/models/malpun.model";

export const absenMalpun = async (req: Request, res: Response) => {
  try {
    // code validation
    const validateCode = await absenMalpunSchema.safeParseAsync(req.body);
    if (!validateCode.success) {
      return validationError(res, parseZodError(validateCode.error));
    }

    // LOGGING DL XIXIXI
    const code = validateCode.data.code;
    const nimSender =
      req.user?.role === "panitia" ? req.user.data.nim : undefined;

    // entry pertama
    const absenExternal = await db.malpunExternal.findFirst({
      where: {
        code,
      },
    });

    // if true (its external)
    if (absenExternal) {
      if (absenExternal.attendance) {
        return forbidden(
          res,
          "Tidak dapat melakukan absen, karena sudah melakukan absen sebelumnya"
        );
      }
      // payment validation check
      if (!absenExternal.validatedAt || !absenExternal.transactionId) {
        return forbidden(
          res,
          "Tidak dapat melakukan absen, karena belum melakukan pembayaran atau belum validasi pembayaran"
        );
      }
      const absenMalpun = await db.malpunExternal.update({
        where: {
          id: absenExternal.id,
        },
        data: {
          attendance: true,
          attendanceTime: new Date(),
        },
      });
      logging(
        "LOGS",
        `Absen Malpun berhasil dilakukan untuk '${absenExternal.fullName}' (External), oleh panitia ${nimSender}`
      );
      return success(
        res,
        `Absen Malpun berhasil dilakukan untuk '${absenExternal.fullName}' (External)`
      );
    }

    const absenInternal = await db.malpunInternal.findFirst({
      where: {
        code,
      },
    });

    // if true (its internal)
    if (!absenInternal) {
      return notFound(res, "Code tidak ditemukan atau tidak valid");
    }

    if (absenInternal.attendance) {
      return forbidden(
        res,
        "Tidak dapat melakukan absen, karena sudah melakukan absen sebelumnya"
      );
    }

    await db.malpunInternal.update({
      where: {
        id: absenInternal.id,
      },
      data: {
        attendance: true,
        attendanceTime: new Date(),
      },
    });

    logging(
      "LOGS",
      `Absen Malpun berhasil dilakukan untuk mahasiswa dengan id: ${absenInternal.mahasiswaId} (Internal), oleh panitia ${nimSender}`
    );
    return success(
      res,
      `Absen Malpun berhasil dilakukan untuk mahasiswa dengan id: ${absenInternal.mahasiswaId} (Internal)`
    );
  } catch (err) {
    logging("ERROR", `Error trying to set Absen Malpun`, err);
    return internalServerError(res);
  }
};
