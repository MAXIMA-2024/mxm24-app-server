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
import { object } from "zod";
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

//
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
  }
};
