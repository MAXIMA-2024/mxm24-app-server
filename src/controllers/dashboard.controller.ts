import type { Request, Response } from "express";
import { internalServerError, success } from "@/utils/responses";
import db from "@/services/db";
import logging from "@/utils/logging";
import type { OrganisatorUpdatable } from "@/models/accounts/organisator.model";

// Panitia mahasiswa organisator state
export const dashboardStatistics = async (req: Request, res: Response) => {
  try {
    const panitia = await db.panitia.count({
      where: { isVerified: true },
    });

    const mahasiswa = await db.mahasiswa.count();

    const organisator = await db.organisator.count({
      where: { isVerified: true },
    });

    const state = await db.stateRegistration.count();

    const malpun = "TO-DO";

    const data = { panitia, mahasiswa, organisator, state, malpun };

    return success(res, "Berhasil mendapatkan jumlah statistic", data);
  } catch (err) {
    logging("ERROR", "Error when trying to fetch statistic count", err);
    return internalServerError(res);
  }
};

// Organisator stats
export const dashboardOrganisator = async (req: Request, res: Response) => {
  try {
    const stateOrganisator = await db.organisator.count({
      where: {
        stateId: (req.user?.data as OrganisatorUpdatable).stateId,
        isVerified: true,
      },
    });

    const mahasiswa = await db.stateRegistration.count({
      where: {
        stateId: (req.user?.data as OrganisatorUpdatable).stateId,
      },
    });

    const data = {
      stateOrganisator,
      mahasiswa,
    };

    return success(
      res,
      "Berhasil mendapatkan jumlah statistic organisator",
      data
    );
  } catch (err) {
    logging("ERROR", "Error when trying to fetch organisator statistic", err);
    return internalServerError(res);
  }
};
