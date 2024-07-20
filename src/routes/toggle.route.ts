import { Router } from "express";

import {
  allToggles,
  togglebyId,
  createToggle,
  toggleToggle,
  deleteToggle,
} from "@/controllers/toggles.controller";

import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import { DivisiPanitia } from "@/models/divisiPanitia.model";

const router = Router();

// toggles
router.get("/", allToggles);
router.get("/:id", togglebyId);
router.post(
  "/",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([DivisiPanitia.NOVATOR, DivisiPanitia.CHARTA]),
  createToggle
);
router.put(
  "/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([DivisiPanitia.NOVATOR, DivisiPanitia.CHARTA]),
  toggleToggle
);
router.delete(
  "/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([DivisiPanitia.NOVATOR, DivisiPanitia.CHARTA]),
  deleteToggle
);

export default router;
