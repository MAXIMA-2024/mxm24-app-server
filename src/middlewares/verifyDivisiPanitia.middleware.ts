import db from "@/services/db";
import { forbidden } from "@/utils/responses";
import type { Request, Response, NextFunction } from "express";

/**
 * Middleware factory to verify if the user belongs to the specified division(s) of panitia.
 * @param divisiIds - An array of division IDs that the user should belong to.
 * @returns The middleware function that checks if the user has access to the specified division(s).
 */
const verifyDivisiPanitia =
  (divisiIds: number[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "panitia") {
      return forbidden(res, `You don't have access to this feature`);
    }

    const divisi = await db.divisiPanitia.findUnique({
      where: {
        id: req.user.data.divisiId,
      },
    });

    if (divisiIds.includes(divisi?.id!)) {
      return next();
    }

    return forbidden(
      res,
      `${divisi?.name} don't have access to access this feature`
    );
  };

export default verifyDivisiPanitia;
