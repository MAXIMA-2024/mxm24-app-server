import type { Request, Response } from "express";
import {
  conflict,
  created,
  internalServerError,
  notFound,
  parseZodError,
  success,
  unauthorized,
  validationError,
  forbidden,
} from "@/utils/responses";

import db from "@/services/db";

//day model
import { daySchema, type Day } from "@/models/state/day.model";

//state model
import {
  stateSchema,
  stateUpdatableSchema,
  stateIdSchema,
  type stateUpdatableSchemaT,
  type stateIdSchemaT,
} from "@/models/state/state.model";
import logging from "@/utils/logging";
import { idSchema } from "@/models/id.model";

import type { UploadedFile } from "express-fileupload";
import { nanoid } from "nanoid";
import path from "path";
import bucket from "@/services/r2";

//me-return semua hari acara state maxima
export const enumDay = async (req: Request, res: Response) => {
  try {
    const days = await db.day.findMany();
    return success(res, "Berhasil mendapatkan semua hari state", days);
  } catch (err) {
    return internalServerError(res);
  }
};

//me-return semua state yang terdaftar dalam maxima
export const getAllState = async (req: Request, res: Response) => {
  try {
    const states = await db.state.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        quota: true,
        day: true,
        _count: {
          select: {
            StateRegistration: true,
          },
        },
      },
    });

    return success(res, "Berhasil mendapatkan semua state", states);
  } catch (err) {
    return internalServerError(res);
  }
};

//me-return detail state berdasarkan id
export const showState = async (req: Request, res: Response) => {
  try {
    const validate = await stateIdSchema.safeParseAsync(req.params);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const state = await db.state.findUnique({
      where: { id: validate.data.id },
      include: {
        _count: {
          select: {
            StateRegistration: true,
          },
        },
        day: true,
        gallery: true,
      },
    });

    if (!state) {
      return notFound(
        res,
        `Data state dengan id ${validate.data.id} tidak ditemukan`
      );
    }

    return success(res, "Berhasil mendapatkan data state", state);
  } catch (err) {
    return internalServerError;
  }
};

//me-return daftar peserta yang terdaftar pada state sesuai id
export const showStatePeserta = async (req: Request, res: Response) => {
  try {
    const validate = await stateIdSchema.safeParseAsync(req.params);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const state = await db.stateRegistration.findMany({
      where: { stateId: validate.data.id },
      include: {
        mahasiswa: {
          select: {
            id: true,
            nim: true,
            name: true,
            email: true,
            token: true,
          },
        },
      },
    });

    return success(res, "Berhasil mendapatkan data peserta", state);
  } catch (err) {
    return internalServerError;
  }
};

//menambah state baru
export const addState = async (
  req: Request<{}, {}, stateUpdatableSchemaT>,
  res: Response
) => {
  try {
    const validate = await stateUpdatableSchema.safeParseAsync(req.body);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const state = await db.state.create({
      data: { ...validate.data, logo: "-" },
    });

    if (req.user?.role === "panitia") {
      logging(
        "LOGS",
        `Panitia ${req.user.data.name} - ${req.user.data.nim} menambahkan state ${state.name}`
      );
    }

    return created(res, "Berhasil menambahkan state", state);
  } catch (err) {
    internalServerError(res);
  }
};

//remove state sesuai id
export const removeState = async (req: Request, res: Response) => {
  try {
    const validate = await stateIdSchema.safeParseAsync(req.params);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const isExist = await db.state.findFirst({
      where: { id: validate.data.id },
      include: {
        gallery: true,
      },
    });

    if (!isExist) {
      return notFound(
        res,
        `STATE dengan id ${validate.data.id} tidak ditemukan`
      );
    }

    // delete state logo
    if (isExist.logo !== "-") {
      await bucket.deleteObject(isExist.logo);
    }

    // delete state gallery
    await Promise.all(
      isExist.gallery.map(async (gallery) => {
        await bucket.deleteObject(gallery.url);
      })
    );

    const state = await db.state.delete({ where: { id: validate.data.id } });

    if (req.user?.role === "panitia") {
      logging(
        "LOGS",
        `Panitia ${req.user.data.name} - ${req.user.data.nim} menghapus state ${state.name}`
      );
    }

    return success(res, "Berhasil Menghapus state");
  } catch (err) {
    return internalServerError(res);
  }
};

//edit informasi pada state sesuai id
export const editState = async (
  req: Request<{}, {}, Partial<stateUpdatableSchemaT>>,
  res: Response
) => {
  try {
    const validateId = await stateIdSchema.safeParseAsync(req.params);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }

    const validate = await stateUpdatableSchema
      .partial()
      .safeParseAsync(req.body);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    //checking manual apakah panitia merupakan enum 1 2 3 4
    if (
      req.user?.role === "panitia" &&
      ![1, 2, 3, 4].includes(req.user.data.divisiId)
    ) {
      return forbidden(
        res,
        "Divisi anda tidak memiliki akses untuk mengedit STATE ini"
      );
    }

    if (
      req.user?.role === "organisator" &&
      req.user.data.stateId !== validateId.data.id
    ) {
      return forbidden(
        res,
        "Anda tidak memiliki akses untuk mengedit STATE lain"
      );
    }

    const isExist = await db.state.findFirst({
      where: { id: validateId.data.id },
    });

    if (!isExist) {
      return notFound(
        res,
        `state dengan id ${validateId.data.id} tidak ditemukan`
      );
    }

    const state = await db.state.update({
      where: { id: validateId.data.id },
      data: validate.data,
    });

    if (req.user?.role === "panitia") {
      logging(
        "LOGS",
        `Panitia ${req.user.data.name} - ${req.user.data.nim} mengubah informasi state ${state.name}`
      );
    }

    if (req.user?.role === "organisator") {
      logging(
        "LOGS",
        `Organisator ${req.user.data.name} - ${req.user.data.nim} mengubah informasi state ${state.name}`
      );
    }

    return success(res, "Berhasil mengupdate state", state);
  } catch (err) {
    return internalServerError(res);
  }
};

//menambah logo state sesuai id
export const addStateLogo = async (req: Request, res: Response) => {
  try {
    const validateId = await idSchema.safeParseAsync(req.params.id);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }

    if (
      req.user?.role === "panitia" &&
      ![
        1, // Novator
        2, // Charta
        3, // Actus
        4, // Scriptum
      ].includes(req.user.data.divisiId)
    ) {
      return unauthorized(
        res,
        "Divisi anda tidak memiliki akses untuk mengupload logo state"
      );
    }

    if (
      req.user?.role === "organisator" &&
      req.user.data.stateId !== validateId.data
    ) {
      return unauthorized(
        res,
        "Anda tidak memiliki akses untuk mengupload logo STATE lain"
      );
    }

    const state = await db.state.findUnique({
      where: { id: validateId.data },
    });

    if (!state) {
      return notFound(
        res,
        `STATE dengan id ${validateId.data} tidak ditemukan`
      );
    }

    if (!req.files || !req.files.logo) {
      return validationError(res, "Logo is required");
    }

    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    const logo = req.files.logo as UploadedFile;

    if (!allowedMimeTypes.includes(logo.mimetype)) {
      return validationError(res, "Logo must be an image file");
    }

    const fileName = `logo.${logo.mimetype.split("/")[1]}`;

    const upload = await bucket.uploadStream(
      logo.data,
      `/public/state/${state.id}/${fileName}`
    );

    await db.state.update({
      where: { id: state.id },
      data: { logo: upload.objectKey },
    });

    return success(res, "Berhasil mengupload logo state", {
      logo: upload.objectKey,
    });
  } catch (err) {
    logging("ERROR", "Failed to upload state logo", err);
    return internalServerError(res);
  }
};

//menambah gallery pada state sesuai id
export const addStateGallery = async (req: Request, res: Response) => {
  try {
    const validateId = await idSchema.safeParseAsync(req.params.id);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }

    if (
      req.user?.role === "panitia" &&
      ![
        1, // Novator
        2, // Charta
        3, // Actus
        4, // Scriptum
      ].includes(req.user.data.divisiId)
    ) {
      return unauthorized(
        res,
        "Divisi anda tidak memiliki akses untuk mengupload logo state"
      );
    }

    if (
      req.user?.role === "organisator" &&
      req.user.data.stateId !== validateId.data
    ) {
      return unauthorized(
        res,
        "Anda tidak memiliki akses untuk mengupload logo STATE lain"
      );
    }

    const state = await db.state.findUnique({
      where: { id: validateId.data },
      include: {
        _count: {
          select: { gallery: true },
        },
      },
    });

    if (!state) {
      return notFound(
        res,
        `STATE dengan id ${validateId.data} tidak ditemukan`
      );
    }

    if (state._count.gallery >= 5) {
      return conflict(res, "Gallery STATE maksimal 5 gambar");
    }

    if (!req.files || !req.files.gallery) {
      return validationError(res, "Gallery is required");
    }

    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    const gallery = req.files.gallery;
    const galleryArray = Array.isArray(gallery) ? gallery : [gallery];

    if (galleryArray.length + state._count.gallery > 5) {
      return conflict(res, "Gallery STATE maksimal 5 gambar");
    }

    const isMimeSafe = galleryArray.every((file) =>
      allowedMimeTypes.includes(file.mimetype)
    );
    if (!isMimeSafe) {
      return validationError(res, "All objects must be an image file");
    }

    await Promise.all(
      galleryArray.map(async (file) => {
        const fileName = `${nanoid()}.${file.mimetype.split("/")[1]}`;

        const upload = await bucket.uploadStream(
          file.data,
          `/public/state/${state.id}/gallery/${fileName}`
        );

        await db.stateGallery.create({
          data: {
            stateId: state.id,
            url: upload.objectKey,
          },
        });
      })
    );

    return created(res, "Berhasil mengupload gallery state");
  } catch (err) {
    logging("ERROR", "Failed to upload state gallery", err);
    return internalServerError(res);
  }
};

export const deleteStateGallery = async (req: Request, res: Response) => {
  try {
    const validateId = await idSchema.safeParseAsync(req.params.id);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }

    const validateGalleryId = await idSchema.safeParseAsync(
      req.params.galleryId
    );
    if (!validateGalleryId.success) {
      return validationError(res, parseZodError(validateGalleryId.error));
    }

    if (
      req.user?.role === "panitia" &&
      ![
        1, // Novator
        2, // Charta
        3, // Actus
        4, // Scriptum
      ].includes(req.user.data.divisiId)
    ) {
      return unauthorized(
        res,
        "Divisi anda tidak memiliki akses untuk mengupload logo state"
      );
    }

    if (
      req.user?.role === "organisator" &&
      req.user.data.stateId !== validateId.data
    ) {
      return unauthorized(
        res,
        "Anda tidak memiliki akses untuk mengupload logo STATE lain"
      );
    }

    const gallery = await db.stateGallery.findUnique({
      where: {
        stateId: validateId.data,
        id: validateGalleryId.data,
      },
    });

    if (!gallery) {
      return notFound(
        res,
        `Gallery dengan id ${validateGalleryId.data} tidak ditemukan`
      );
    }

    // delete file
    await bucket.deleteObject(gallery.url);

    await db.stateGallery.delete({
      where: {
        stateId: validateId.data,
        id: validateGalleryId.data,
      },
    });

    return success(res, "Berhasil menghapus gallery state");
  } catch (err) {
    logging("ERROR", "Failed to delete state gallery", err);
    return internalServerError(res);
  }
};

//enum organisator
export const enumOrganisator = async (req: Request, res: Response) => {
  try {
    const states = await db.state.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return success(res, "Berhasil mendapatkan semua enum state", states);
  } catch (err) {
    return internalServerError(res);
  }
};
