import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import logging from "@/utils/logging";
import parseXML from "@/utils/xml-parser";
import db from "@/services/db";
import ENV from "@/utils/env";
import {
  panitiaUpdatableSchema,
  type PanitiaUpdatable,
} from "@/models/accounts/panitia.model";
import { roleSchema } from "@/models/accounts/role.model";
import { nanoid } from "nanoid";

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
  notFound,
} from "@/utils/responses";
import type { JWTModel, JWTRefreshModel } from "@/models/auth/jwt.model";
import {
  organisatorUpdatableSchema,
  type OrganisatorUpdatable,
} from "@/models/accounts/organisator.model";
import {
  mahasiswaUpdatableSchema,
  type MahasiswaUpdatable,
} from "@/models/accounts/mahasiswa.model";
import { uniqueCodeSchema } from "@/models/auth/unique-code.model";
import { verifyCaptcha } from "@/services/turnstile";

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
        partitioned: true,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      res.cookie("jwt_refresh", jwtRefreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        partitioned: true,
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
        partitioned: true,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      res.cookie("jwt_refresh", jwtRefreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        partitioned: true,
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
        partitioned: true,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      res.cookie("jwt_refresh", jwtRefreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        partitioned: true,
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
      partitioned: true,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });

    res.cookie("jwt_refresh", jwtRefreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "none",
      partitioned: true,
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
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        partitioned: true,
      });
      res.clearCookie("jwt_refresh", {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        partitioned: true,
      });
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
        partitioned: true,
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
        partitioned: true,
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
        partitioned: true,
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
      partitioned: true,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });

    return success(res, "JWT refreshed successfully", {
      role: "unknown",
      email: data.email,
    });
  } catch (err) {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "none",
      partitioned: true,
    });
    res.clearCookie("jwt_refresh", {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "none",
      partitioned: true,
    });
    return unauthorized(res, "Invalid refresh token, try login again");
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "none",
    partitioned: true,
  });
  res.clearCookie("jwt_refresh", {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "none",
    partitioned: true,
  });
  return success(res, "Logged out successfully");
};

export const profile = async (req: Request, res: Response) => {
  if (!req.user) {
    return unauthorized(res, "No user found");
  }

  return success(res, "Berhasil mendapatkan data user", req.user);
};

export const profileUpdate = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return unauthorized(res, "No user found");
    }

    const validateData = await mahasiswaUpdatableSchema
      .partial()
      .safeParseAsync(req.body);
    if (!validateData.success) {
      return validationError(res, parseZodError(validateData.error));
    }

    const isExist = await db.mahasiswa.findFirst({
      where: { email: req.user.data.email },
    });
    if (!isExist) {
      return notFound(res, "Data Mahasiswa tidak ditemukan");
    }

    const mahasiswa = await db.mahasiswa.update({
      where: { email: req.user.data.email },
      data: validateData.data,
    });

    if (req.user.role === "mahasiswa") {
      logging(
        "LOGS",
        `${req.user.data.nim} mengupdate data mahasiswa`,
        mahasiswa
      );
    }
    return success(res, "Berhasil mengupdate data mahasiswa", mahasiswa);
  } catch (err) {
    logging("ERROR", "Error when trying to update mahasiswa data", err);
    return internalServerError(res);
  }
};

type Onboarding =
  | {
      role: "panitia";
      data: PanitiaUpdatable;
    }
  | {
      role: "organisator";
      data: OrganisatorUpdatable;
    }
  | {
      role: "mahasiswa";
      data: MahasiswaUpdatable;
    };

export const preOnboardingMahasiswa = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "unknown") {
      return badRequest(res, "User already registered");
    }

    const email = req.user.data.email;

    const dataMaba = await db.dataMaba.findFirst({
      where: { email },
    });

    if (!dataMaba) {
      return notFound(
        res,
        "Maaf, kamu tidak terdaftar sebagai mahasiswa baru 2024. Jika ini merupakan kesalahan, silahkan hubungi panitia melalui @maximaumn dan memberikan bukti yang konkrit."
      );
    }

    return success(res, "Berhasil mendapatkan data mahasiswa", dataMaba);
  } catch (err) {
    logging("ERROR", "Error while trying to pre-onboard user", err);
    return internalServerError(res);
  }
};

export const onboarding = async (
  req: Request<{}, {}, Onboarding>,
  res: Response
) => {
  try {
    if (req.user?.role !== "unknown") {
      return badRequest(res, "User already registered");
    }

    const validateRole = await roleSchema.safeParseAsync(req.body.role);
    if (!validateRole.success) {
      return validationError(res, parseZodError(validateRole.error));
    }

    if (req.body.role === "mahasiswa") {
      const validateData = await mahasiswaUpdatableSchema.safeParseAsync(
        req.body.data
      );
      if (!validateData.success) {
        return validationError(res, parseZodError(validateData.error));
      }

      const newMahasiswa = await db.mahasiswa.create({
        data: {
          ...validateData.data,
          token: `MXM24-${nanoid(10)}`,
        },
      });

      // put email to queue
      const resp = await fetch(`${ENV.APP_MQ_URL}/welcome`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: newMahasiswa.id,
        }),
      });

      if (resp.status !== 200) {
        logging(
          "LOGS",
          `Failed to send welcoming email to queue for mahasiswa id: ${newMahasiswa.id}`
        );
        // logging error aja, biarin tetep bisa masuk
      }

      const jwtToken = jwt.sign(
        {
          email: newMahasiswa.email,
          role: "mahasiswa",
          ticket: req.jwt?.ticket!,
        } as JWTModel,
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      res.cookie("jwt", jwtToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        partitioned: true,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      return success(
        res,
        "Mahasiswa account created successfully",
        newMahasiswa
      );
    }

    if (req.body.role === "organisator") {
      const validateData = await organisatorUpdatableSchema.safeParseAsync(
        req.body.data
      );
      if (!validateData.success) {
        return validationError(res, parseZodError(validateData.error));
      }

      const newOrganisator = await db.organisator.create({
        data: {
          ...validateData.data,
          stateId: undefined,
          isVerified: false,
          state: {
            connect: {
              id: validateData.data.stateId,
            },
          },
        },
      });

      const resp = await fetch(
        `${ENV.APP_MQ_URL}/welcome/internal/organisator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: newOrganisator.id,
          }),
        }
      );

      if (resp.status !== 200) {
        logging(
          "LOGS",
          `Failed to send welcoming email to queue for organisator id: ${newOrganisator.id}`
        );
        // logging error aja, biarin tetep bisa masuk
      }

      const jwtToken = jwt.sign(
        {
          email: newOrganisator.email,
          role: "organisator",
          ticket: req.jwt?.ticket!,
        } as JWTModel,
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      res.cookie("jwt", jwtToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        partitioned: true,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      return success(
        res,
        "Organisator account created successfully",
        newOrganisator
      );
    }

    if (req.body.role === "panitia") {
      const validateData = await panitiaUpdatableSchema.safeParseAsync(
        req.body.data
      );
      if (!validateData.success) {
        return validationError(res, parseZodError(validateData.error));
      }

      const newPanitia = await db.panitia.create({
        data: {
          ...validateData.data,
          isVerified: false,
          divisi: {
            connect: {
              id: validateData.data.divisiId,
            },
          },
          divisiId: undefined,
        },
      });

      const resp = await fetch(`${ENV.APP_MQ_URL}/welcome/internal/panitia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: newPanitia.id,
        }),
      });

      if (resp.status !== 200) {
        logging(
          "LOGS",
          `Failed to send welcoming email to queue for panitia id: ${newPanitia.id}`
        );
        // logging error aja, biarin tetep bisa masuk
      }

      const jwtToken = jwt.sign(
        {
          email: newPanitia.email,
          role: "panitia",
          ticket: req.jwt?.ticket!,
        } as JWTModel,
        ENV.APP_JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      res.cookie("jwt", jwtToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "none",
        partitioned: true,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });

      return success(res, "Panitia account created successfully", newPanitia);
    }
  } catch (err) {
    logging("ERROR", "Error while trying onboard user", err);
    return internalServerError(res);
  }
};

export const organisatorLoginCode = async (req: Request, res: Response) => {
  try {
    const validate = await uniqueCodeSchema.safeParseAsync(req.body);

    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const ip = req.headers["CF-Connecting-IP"] as string;

    const validateTurnstile = await verifyCaptcha(
      validate.data.turnstileToken,
      ip
    );

    if (!validateTurnstile) {
      return badRequest(res, "Invalid captcha token");
    }

    const organisator = await db.organisator.findFirst({
      where: {
        uniqueCode: validate.data.uniqueCode,
      },
    });

    if (!organisator) {
      return notFound(res, "Invalid unique code");
    }

    const jwtToken = jwt.sign(
      {
        email: organisator.email,
        role: "organisator",
        ticket: "unique-code",
      },
      ENV.APP_JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const jwtRefreshToken = jwt.sign(
      {
        email: organisator.email,
        ticket: "unique-code",
      },
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
      partitioned: true,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });

    res.cookie("jwt_refresh", jwtRefreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "none",
      partitioned: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return success(res, "Logged in successfully", {
      role: "organisator",
      email: organisator.email,
    });
  } catch (err) {
    logging("ERROR", "Error trying to login organisator via unique code", err);
    return internalServerError(res);
  }
};
