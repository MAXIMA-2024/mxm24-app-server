import { response, type Request, type Response } from "express";
import type { MidtransCallback } from "@/models/malpun/external.model";
import logging from "@/utils/logging";
import db from "@/services/db";
import {
  internalServerError,
  created,
  validationError,
  parseZodError,
  notFound,
  success,
  badRequest,
} from "@/utils/responses";

import { nanoid } from "nanoid"; //generate random id

//model schema
import { externalUpdatableSchema } from "@/models/malpun/external.model";
import { absenMalpunSchema, type AbsenMalpun } from "@/models/malpun.model";

import ENV from "@/utils/env";

//POST Method
//menambah account untuk pendaftaran malpun external
export const addAccountExternal = async (req: Request, res: Response) => {
  try {
    const validate = await externalUpdatableSchema.safeParseAsync(req.body);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const token = `MXM24-${nanoid(16)}`;

    const API_URL =
      ENV.MIDTRANS_ENV == "sandbox"
        ? "https://app.sandbox.midtrans.com/snap/v1/transactions"
        : "https://app.midtrans.com/snap/v1/transactions";
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(ENV.MIDTRANS_SERVER_KEY + ":")}}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: token,
          gross_amount: 35000,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: validate.data.fullName,
          email: validate.data.email,
        },
      }),
    });

    if (resp.status != 201) {
      return badRequest(
        res,
        "terjadi kesalahan pada midtrans harap coba kembali"
      );
    }

    const account = await db.malpunExternal.create({
      data: {
        fullName: validate.data.fullName,
        email: validate.data.email,
        code: token,
      },
    });

    return created(res, "Berhasil menambahkan account", {
      account: account,
      midtrans: await resp.json(),
    });
  } catch (err) {
    internalServerError(res);
  }
};

// midtrans callback
export const midtransCallback = async (
  req: Request<{}, {}, MidtransCallback>,
  res: Response
) => {
  try {
    const { transaction_status, transaction_id, order_id, transaction_time } =
      req.body;
    const account = await db.malpunExternal.findFirst({
      where: { code: order_id },
    });
    if (!account) {
      return notFound(res, "order not found");
    }

    if (transaction_status == "settlement") {
      const updatedAccount = await db.malpunExternal.update({
        where: { id: account.id },
        data: {
          transactionId: transaction_id,
          validatedAt: new Date(transaction_time),
        },
      });
      return success(res, "transaction succeed", updatedAccount);
    }

    return success(res, "Pembayaran sedang dalam status pending", account);
  } catch (err) {
    internalServerError(res);
};


export const ticketMalpunDetail = async (req: Request, res: Response) => {
  try {
    // code validation
    const validateCode = await absenMalpunSchema.safeParseAsync(req.params);
    if (!validateCode.success) {
      return validationError(res, parseZodError(validateCode.error));
    }

    const code = validateCode.data.code;

    // entry pertama
    const absenExternal = await db.malpunExternal.findFirst({
      where: {
        code,
      },
    });

    // if true (its external)
    if (absenExternal) {
      if (!absenExternal.transactionId || !absenExternal.validatedAt) {
        return forbidden(
          res,
          "Ticket tidak valid, karena belum melakukan pembayaran atau belum validasi pembayaran"
        );
      }

      return success(res, "Berhasil mendapatkan detail MalPun", {
        code: absenExternal.code,
        detail: absenExternal,
        status: "external",
      });
    }

    const absenInternal = await db.malpunInternal.findFirst({
      where: {
        code,
      },
      include: {
        mahasiswa: {
          select: {
            nim: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // if true (its internal)
    if (!absenInternal) {
      return notFound(res, "Ticket tidak ditemukan atau tidak valid");
    }

    return success(res, "Berhasil mendapatkan detail absen MalPun", {
      code: absenInternal.code,
      detail: absenInternal,
      status: "internal",
    });
  } catch (err) {
    logging("ERROR", `Error trying to set Absen Malpun`, err);
    return internalServerError(res);
  }
};

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
