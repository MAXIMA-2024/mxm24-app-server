import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import logging from "@/utils/logging";
import { unauthorized } from "@/utils/responses";

import db from "@/services/db";
import ENV from "@/utils/env";

import type { JWTModel } from "@/models/auth/jwt.model";

/**
 * Middleware function to verify the JWT token in the request.
 * If the token is valid, it sets the user role and data in the request object.
 * If the token is invalid or expired, it returns an unauthorized response.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next function to call in the middleware chain.
 * @returns Promise<void>
 */
const verifyJwt = async (req: Request, res: Response, next: NextFunction) => {
  const jwtToken = req.cookies.jwt as string | undefined;
  if (!jwtToken) {
    return unauthorized(res, "No JWT provided");
  }

  try {
    const jwtData = jwt.verify(jwtToken, ENV.APP_JWT_SECRET) as JWTModel;
    req.jwt = jwtData;

    const mahasiswa = await db.mahasiswa.findUnique({
      where: {
        email: jwtData.email,
      },
      select: {
        nim: true,
        name: true,
        email: true,
        angkatan: true,
        prodi: true,
        whatsapp: true,
        lineId: true,
      },
    });
    if (mahasiswa) {
      req.user = {
        role: "mahasiswa",
        data: mahasiswa,
      };
      return next();
    }

    const organisator = await db.organisator.findUnique({
      where: {
        email: jwtData.email,
      },
      select: {
        nim: true,
        name: true,
        stateId: true,
      },
    });
    if (organisator) {
      req.user = {
        role: "organisator",
        data: organisator,
      };
      return next();
    }

    const panitia = await db.panitia.findUnique({
      where: {
        email: jwtData.email,
      },
      select: {
        name: true,
        nim: true,
        divisiId: true,
      },
    });
    if (panitia) {
      req.user = {
        role: "panitia",
        data: panitia,
      };
      return next();
    }

    req.user = {
      role: "unknown",
    };

    next();
  } catch (err) {
    return unauthorized(res, "JWT expired or invalid");
  }
};

export default verifyJwt;
