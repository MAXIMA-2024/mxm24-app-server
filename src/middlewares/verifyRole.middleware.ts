import { forbidden } from "@/utils/responses";
import type { Request, Response, NextFunction } from "express";

/**
 * Middleware factory to verify the role of the user.
 * @param role - The role to be verified. Can be one of "panitia", "organisator", "mahasiswa", or "unknown".
 * @returns The middleware function that verifies the role of the user.
 */
const verifyRole =
  (role: ("panitia" | "organisator" | "mahasiswa" | "unknown")[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!role.includes(req.user?.role!)) {
      return forbidden(res, `${role} don't have access to this feature`);
    }

    return next();
  };

export default verifyRole;
