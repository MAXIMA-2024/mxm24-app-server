import type { Request, Response } from "express";
import logging from "@/utils/logging";
import db from "@/services/db";
import {
  internalServerError,
  created,
  validationError,
  parseZodError,
  notFound,
  success,
  conflict,
  unauthorized,
} from "@/utils/responses";

// Random Id
import { nanoid } from "nanoid";

// Code Validation
import {
  codeValidationSchema,
  internalUpdatableSchema,
} from "@/models/malpun/internal.model";
import ENV from "@/utils/env";

export const addTicketInternal = async (req: Request, res: Response) => {
  try {
    const validate = await internalUpdatableSchema.safeParseAsync(req.body);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const mahasiswa = await db.mahasiswa.findUnique({
      where: {
        email: req.user?.data.email,
      },
    });
    if (!mahasiswa) {
      return notFound(res, "Mahasiswa tidak ditemukan");
    }

    const ticket = await db.malpunInternal.findFirst({
      where: {
        mahasiswaId: mahasiswa.id,
      },
    });
    if (ticket) {
      return conflict(res, "Ticket sudah di claim");
    }

    // check for alfagiftId dupe
    const duplicate = await db.malpunInternal.findFirst({
      where: {
        alfagiftId: validate.data.alfagiftId,
      },
    });

    if (duplicate) {
      return conflict(res, "Kode Alfagift sudah digunakan");
    }

    const newTicket = await db.malpunInternal.create({
      data: {
        code: `MXM24-${nanoid(16)}`,
        mahasiswaId: mahasiswa.id,
        alfagiftId: validate.data.alfagiftId,
      },
    });

    // send email
    const resp = await fetch(`${ENV.APP_MQ_URL}/malpun/internal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: newTicket.id,
      }),
    });

    if (resp.status !== 200) {
      logging(
        "LOGS",
        `Failed to send Malpun claim internal email for user id: ${newTicket.id}`
      );
    }

    logging("LOGS", `${mahasiswa.nim} melakukan claim ticekt`, newTicket);
    return created(res, "Ticket berhasil di claim", newTicket);
  } catch (err) {
    logging("ERROR", "Error when trying to fetch ticket data", err);
    return internalServerError(res);
  }
};

export const getTicketInternal = async (req: Request, res: Response) => {
  try {
    const ticket = await db.malpunInternal.findFirst({
      where: {
        mahasiswa: {
          email: req.user?.data.email,
        },
      },
      select: {
        id: true,
        code: true,
        createdAt: true,
        alfagiftId: true,
        attendance: true,
        attendanceTime: true,
        mahasiswa: {
          select: {
            name: true,
            nim: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      return success(res, "Ticket belum di claim", {
        status: "unclaimed",
      });
    }

    return success(
      res,
      `Ticket di claim pada ${ticket.createdAt.toLocaleDateString()}(mm/dd/yyyy) ${ticket.createdAt.toLocaleTimeString()}`,
      {
        status: "claimed",
        ticket,
      }
    );
  } catch (err) {
    logging("ERROR", "Error when trying to fetch ticket data", err);
    return internalServerError(res);
  }
};
