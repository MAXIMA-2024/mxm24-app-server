import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";

import {
  getAllDay,
  getAllState,
  showState,
  showStatePeserta,
  addState,
  removeState,
  editState,
  addStateLogo,
  addStateGallery,
  deleteStateGallery,
} from "@/controllers/state.controller";

import fileUpload from "express-fileupload";
import { badRequest } from "@/utils/responses";

const router = Router();

router.get("/enum/dayManagement", getAllDay);
router.get("/", verifyJwt, getAllState);
router.get("/:id", verifyJwt, showState);
router.get("/:id/peserta", showStatePeserta);
router.post("/", verifyJwt, verifyRole, addState);
router.delete(
  "/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2, 3, 4]),
  removeState
);
router.patch(
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
