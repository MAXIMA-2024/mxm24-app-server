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
  unauthorized
} from "@/utils/responses";

// Random Id
import { nanoid } from "nanoid"; 

// Code Validation
import { 
    codeValidationSchema,
 } from "@/models/malpun/internal.model";

export const addTicketInternal = async (req: Request, res: Response) => {
    try {
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
            }
        });
        if (ticket) {
            return conflict(res, "Ticket sudah di claim");
        }
        const newTicket = await db.malpunInternal.create({
            data: {
                code: `MXM24-${nanoid(16)}`,
                mahasiswaId: mahasiswa.id,
                alfagiftId: req.body.alfagiftId ? req.body.alfagiftId : null,
            }
        })
        logging("LOGS", `${mahasiswa.nim} melakukan claim ticekt`, newTicket)
        return created(res, "Ticket berhasil di claim", newTicket);
    } catch (err) {
        logging("ERROR", "Error when trying to fetch ticket data", err);
        return internalServerError(res);
    }
}

export const getTicektInternal = async (req: Request, res: Response) => {
    try {
        const validateCode = await codeValidationSchema.safeParseAsync(req.params);
        if (!validateCode.success) {
            return validationError(res, parseZodError(validateCode.error));
        }
        const ticket = await db.malpunInternal.findFirst({
            where: {
                code: validateCode.data.code,
            },
            select: {
                code: true,
                createdAt: true,
            }
        });
        if (!ticket) {
            return notFound(res, "Ticket tidak ditemukan");
        }
        return success(res, 
            `Ticket di claim pada ${ticket.createdAt.toLocaleDateString()}(mm/dd/yyyy) ${ticket.createdAt.toLocaleTimeString()}`, ticket);
    } catch (err) {
        logging("ERROR", "Error when trying to fetch ticket data", err);
        return internalServerError(res);
    }
};