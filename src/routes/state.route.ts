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
} from "@/controllers/state.controller";

const router = Router();

router.get("/enum/dayManagement", getAllDay);
router.get("/", verifyJwt, getAllState);
router.get("/:id", verifyJwt, showState);
router.get("/:id/peserta", showStatePeserta);
router.post("/", verifyJwt, verifyRole, addState);
router.delete("/:id", removeState);
router.patch("/:id", editState);

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
