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
import { verifikasiSchema, type Verifikasi } from "@/models/verifikasi.model";
import ENV from "@/utils/env";

export const dataVerifikasi = async (req: Request, res: Response) => {
  try {
    const panitia = await db.panitia.findMany({
      select: {
        id: true,
        nim: true,
        name: true,
        email: true,
        divisi: true,
        isVerified: true,
      },
    });

    const organisator = await db.organisator.findMany({
      select: {
        id: true,
        nim: true,
        name: true,
        state: {
          select: {
            name: true,
          },
        },
        isVerified: true,
      },
    });

    const data = [
      ...panitia.map((p) => ({
        ...p,
        divisi: undefined,
        position: p.divisi.name,
        role: "panitia",
      })),
      ...organisator.map((o) => ({
        ...o,
        state: undefined,
        position: o.state.name,
        role: "organisator",
      })),
    ];

    return success(res, "Data verifikasi berhasil didapatkan", data);
  } catch (err) {
    logging("ERROR", `Error trying to get data verifikasi`, err);
    return internalServerError(res);
  }
};

export const verifikasi = async (
  req: Request<{}, {}, Verifikasi>,
  res: Response
) => {
  try {
    const validateBody = await verifikasiSchema.safeParseAsync(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const nimSender =
      req.user?.role === "panitia" ? req.user.data.nim : undefined;

    if (req.body.role === "panitia") {
      const panitia = await db.panitia.findUnique({
        where: {
          id: validateBody.data.id,
        },
      });

      if (!panitia) {
        logging("ERROR", `Panitia not found with id ${validateBody.data.id}`);
        return notFound(
          res,
          `Panitia with id ${validateBody.data.id} did not exist`
        );
      }

      const updatedPanitia = await db.panitia.update({
        where: {
          id: validateBody.data.id,
        },
        data: {
          isVerified: !panitia.isVerified,
        },
        select: {
          id: true,
          nim: true,
          isVerified: true,
        },
      });

      if (updatedPanitia.isVerified) {
        // mail
        const resp = await fetch(ENV.APP_MQ_URL + "/internal/verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "panitia",
            id: updatedPanitia.id,
          }),
        });

        if (!resp.ok) {
          logging(
            "ERROR",
            `Failed to send verification mail for panitia id: ${updatedPanitia.id}`
          );
        }

        logging(
          "LOGS",
          `Panitia with nim ${nimSender} verified the panitia with nim ${updatedPanitia.nim}`
        );

        return success(
          res,
          `Panitia with nim ${updatedPanitia.nim} verified successfully`
        );
      } else {
        logging(
          "LOGS",
          `Panitia with nim ${nimSender} unverified the panitia with nim ${updatedPanitia.nim}`
        );

        return success(
          res,
          `Panitia with nim ${updatedPanitia.nim} removed from verified list`
        );
      }
    }

    const organisator = await db.organisator.findUnique({
      where: {
        id: validateBody.data.id,
      },
    });

    if (!organisator) {
      logging("ERROR", `Organisator not found with id ${validateBody.data.id}`);
      return notFound(
        res,
        `Organisator with id ${validateBody.data.id} did not exist`
      );
    }

    const updatedOrganisator = await db.organisator.update({
      where: {
        id: validateBody.data.id,
      },
      data: {
        isVerified: !organisator.isVerified,
      },
      select: {
        id: true,
        nim: true,
        isVerified: true,
      },
    });

    if (updatedOrganisator.isVerified) {
      const resp = await fetch(ENV.APP_MQ_URL + "/internal/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "organisator",
          id: updatedOrganisator.id,
        }),
      });

      if (!resp.ok) {
        logging(
          "ERROR",
          `Failed to send verification mail for organisator id: ${updatedOrganisator.id}`
        );
      }

      logging(
        "LOGS",
        `Panitia with nim ${nimSender} verified the Organisator with nim ${updatedOrganisator.nim}`
      );

      return success(
        res,
        `Organisator with nim ${updatedOrganisator.nim} verified successfully`
      );
    } else {
      logging(
        "LOGS",
        `Panitia with nim ${nimSender} unverified the Organisator with nim ${updatedOrganisator.nim}`
      );

      return success(
        res,
        `Organisator with nim ${updatedOrganisator.nim} removed from verified list`
      );
    }
  } catch (err) {
    logging("ERROR", `Error trying to verify user`, err);
    return internalServerError(res);
  }
};
