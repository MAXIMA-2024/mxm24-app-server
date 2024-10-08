import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";

//notes tio
// mau logs dimana aja ya ?
// untuk yang update ada error dengan manual role detection
// implementasi yang get allstate
//belum implementasi enum organisator

import {
  enumDay,
  getAllState,
  showState,
  showStatePeserta,
  addState,
  removeState,
  editState,
  addStateLogo,
  addStateGallery,
  deleteStateGallery,
  enumOrganisator,
} from "@/controllers/state.controller";

import {
  getStateRegistration,
  addStateRegistration,
  deleteStateRegistration,
} from "@/controllers/state.registration.controller";

import {
  absenState,
  absenStateDetail,
} from "@/controllers/state.absen.controller";

import fileUpload from "express-fileupload";
import { badRequest } from "@/utils/responses";
import { DivisiPanitia } from "@/models/divisiPanitia.model";

const router = Router();

// enums
router.get("/enum/dayManagement", enumDay);
router.get("/enum/organisator", enumOrganisator);

// state registration
router.get(
  "/registration",
  verifyJwt,
  verifyRole(["mahasiswa"]),
  getStateRegistration
);
router.post(
  "/registration",
  verifyJwt,
  verifyRole(["mahasiswa"]),
  addStateRegistration
);
router.delete(
  "/registration/:id",
  verifyJwt,
  verifyRole(["mahasiswa"]),
  deleteStateRegistration
);

//absen route
router.get(
  "/absen/:token",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([
    DivisiPanitia.NOVATOR,
    DivisiPanitia.CHARTA,
    DivisiPanitia.ACTUS,
    DivisiPanitia.SCRIPTUM,
  ]),
  absenStateDetail
);

router.put(
  "/absen",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([
    DivisiPanitia.NOVATOR,
    DivisiPanitia.CHARTA,
    DivisiPanitia.ACTUS,
    DivisiPanitia.SCRIPTUM,
  ]),
  absenState
);

// state manager
router.get("/", verifyJwt, getAllState);
router.get("/:id", verifyJwt, showState);
router.get("/:id/peserta", showStatePeserta);
router.post(
  "/",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([
    DivisiPanitia.NOVATOR,
    DivisiPanitia.CHARTA,
    DivisiPanitia.ACTUS,
    DivisiPanitia.SCRIPTUM,
  ]),
  addState
);
router.delete(
  "/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([
    DivisiPanitia.NOVATOR,
    DivisiPanitia.CHARTA,
    DivisiPanitia.ACTUS,
    DivisiPanitia.SCRIPTUM,
    4,
  ]),
  removeState
);
router.put(
  "/:id",
  verifyJwt,
  verifyRole(["panitia", "organisator"]),
  editState
);

// logo
router.post(
  "/:id/logo",
  verifyJwt,
  verifyRole(["panitia", "organisator"]),
  fileUpload({
    limits: { fileSize: 1 * 1024 * 1024 },
    limitHandler: (_req, res) => {
      return badRequest(res, "Logo file size is too large, max 1MB");
    },
  }),
  addStateLogo
);

// gallery
router.post(
  "/:id/gallery",
  verifyJwt,
  verifyRole(["panitia", "organisator"]),
  fileUpload({
    limits: { fileSize: 1 * 1024 * 1024 },
    limitHandler: (_req, res) => {
      return badRequest(res, "Gallery file size is too large, max 1MB");
    },
  }),
  addStateGallery
);

router.delete(
  "/:id/gallery/:galleryId",
  verifyJwt,
  verifyRole(["panitia", "organisator"]),
  deleteStateGallery
);

//add state logo
//add galery
// router.get("/:id", verifyJwt, verifyRole(["panitia"]), getOrganisator);
// router.put(
//   "/:id",
//   verifyJwt,
//   verifyRole(["panitia"]),
//   verifyDivisiPanitia([1, 2]),
//   updateOrganisator
// );
// router.delete(
//   "/:id",
//   verifyJwt,
//   verifyRole(["panitia"]),
//   verifyDivisiPanitia([1, 2]),
//   deleteOrganisator
// );

export default router;
