import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import logging from "@/utils/logging";
import parseXML from "@/utils/xml-parser";
import db from "@/services/db";
import ENV from "@/utils/env";

import {
  ssoSchema,
  type CASModel,
  type SSOModel,
} from "@/models/auth/sso.model";
import {
  validationError,
  parseZodError,
  internalServerError,
  badRequest,
  unauthorized,
  success,
} from "@/utils/responses";
import type { JWTModel, JWTRefreshModel } from "@/models/auth/jwt.model";

export const ssoCallback = async (
  req: Request<{}, {}, SSOModel>,
  res: Response
) => {
  try {
    const sso = await ssoSchema.safeParseAsync(req.body);
    if (!sso.success) {
      return validationError(res, parseZodError(sso.error));
    }

    const resp = await fetch(
      `https://sso.umn.ac.id/cas/p3/serviceValidate?ticket=${sso.data.ticket}&service=${sso.data.issuer}`
    );

    if (resp.status !== 200) {
      logging("ERROR", "Failed to validate SSO ticket");
      return badRequest(res, "Invalid SSO ticket, please try again");
    }

    const casData = parseXML<CASModel>(await resp.text());

    if ("cas:authenticationFailure" in casData["cas:serviceResponse"]) {
      return badRequest(
        res,
        "Failed to authenticate with SSO, please try again"
      );
    }

    const email =
      casData["cas:serviceResponse"]["cas:authenticationSuccess"]["cas:user"];

    // checks
    const mahasiswa = await db.mahasiswa.findUnique({
      where: {
        email,
      },
    });
    if (mahasiswa) {
      const jwtToken = jwt.sign(
        {
          email: mahasiswa.email,
          role: "mahasiswa",
          ticket: sso.data.ticket,
        },
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );
      const jwtRefreshToken = jwt.sign(
        {
          email: mahasiswa.email,
          ticket: sso.data.ticket,
        },
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      // set cookie
      res.cookie("jwt", jwtToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      res.cookie("jwt_refresh", jwtRefreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return success(res, "Logged in successfully", {
        role: "mahasiswa",
        email: mahasiswa.email,
      });
    }

    const organisator = await db.organisator.findUnique({
      where: {
        email,
      },
    });
    if (organisator) {
      const jwtToken = jwt.sign(
        {
          email: organisator.email,
          role: "organisator",
          ticket: sso.data.ticket,
        },
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );
      const jwtRefreshToken = jwt.sign(
        {
          email: organisator.email,
          ticket: sso.data.ticket,
        },
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      // set cookie
      res.cookie("jwt", jwtToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      res.cookie("jwt_refresh", jwtRefreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return success(res, "Logged in successfully", {
        role: "organisator",
        email: organisator.email,
      });
    }

    const panitia = await db.panitia.findUnique({
      where: {
        email,
      },
    });
    if (panitia) {
      const jwtToken = jwt.sign(
        {
          email: panitia.email,
          role: "panitia",
          ticket: sso.data.ticket,
        },
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );
      const jwtRefreshToken = jwt.sign(
        {
          email: panitia.email,
          ticket: sso.data.ticket,
        },
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      // set cookie
      res.cookie("jwt", jwtToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      res.cookie("jwt_refresh", jwtRefreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return success(res, "Logged in successfully", {
        role: "panitia",
        email: panitia.email,
      });
    }

    const jwtToken = jwt.sign(
      {
        email,
        role: "unknown",
        ticket: sso.data.ticket,
      } as JWTModel,
      ENV.APP_JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const jwtRefreshToken = jwt.sign(
      {
        email,
        ticket: sso.data.ticket,
      } as JWTRefreshModel,
      ENV.APP_JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // set cookie
    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "none",
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });

    res.cookie("jwt_refresh", jwtRefreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "none",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    logging(
      "DEBUG",
      `Unknown user ${email} logged in. ${jwtToken}. ${jwtRefreshToken}`
    );

    return success(res, "Logged in successfully", {
      role: "unknown",
      email,
    });
  } catch (err) {
    logging("ERROR", "Error trying to parse SSO callback", err);
    return internalServerError(res);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    if (!req.cookies.jwt_refresh) {
      res.clearCookie("jwt");
      res.clearCookie("jwt_refresh");
      return unauthorized(res, "No refresh token found. Please login again");
    }

    const data = jwt.verify(
      req.cookies.jwt_refresh,
      ENV.APP_JWT_REFRESH_SECRET,
      {
        algorithms: ["HS256"],
      }
    ) as JWTModel;

    // checks
    const mahasiswa = await db.mahasiswa.findUnique({
      where: {
        email: data.email,
      },
    });
    if (mahasiswa) {
      const jwtToken = jwt.sign(
        {
          email: mahasiswa.email,
          role: "mahasiswa",
          ticket: data.ticket,
        },
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      // set cookie
      res.cookie("jwt", jwtToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      return success(res, "JWT refreshed successfully", {
        role: "mahasiswa",
        email: mahasiswa.email,
      });
    }

    const organisator = await db.organisator.findUnique({
      where: {
        email: data.email,
      },
    });
    if (organisator) {
      const jwtToken = jwt.sign(
        {
          email: organisator.email,
          role: "organisator",
          ticket: data.ticket,
        },
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      // set cookie
      res.cookie("jwt", jwtToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      return success(res, "JWT refreshed successfully", {
        role: "organisator",
        email: organisator.email,
      });
    }

    const panitia = await db.panitia.findUnique({
      where: {
        email: data.email,
      },
    });
    if (panitia) {
      const jwtToken = jwt.sign(
        {
          email: panitia.email,
          role: "panitia",
          ticket: data.ticket,
        },
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      // set cookie
      res.cookie("jwt", jwtToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      return success(res, "JWT refreshed successfully", {
        role: "panitia",
        email: panitia.email,
      });
    }

    const jwtToken = jwt.sign(
      {
        email: data.email,
        role: "unknown",
        ticket: data.ticket,
      } as JWTModel,
      ENV.APP_JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    // set cookie
    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "none",
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });

    return success(res, "JWT refreshed successfully", {
      role: "unknown",
      email: data.email,
    });
  } catch (err) {
    res.clearCookie("jwt");
    res.clearCookie("jwt_refresh");
    return unauthorized(res, "Invalid refresh token, try login again");
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("jwt");
  res.clearCookie("jwt_refresh");
  return success(res, "Logged out successfully");
};

export const profile = async (req: Request, res: Response) => {
  if (!req.user) {
    return unauthorized(res, "No user found");
  }

  return success(res, "User found", req.user);
};
