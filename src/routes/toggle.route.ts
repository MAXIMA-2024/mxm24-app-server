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

const router = Router();

// toggles
router.get("/", allToggles);
router.get("/:id", togglebyId);
router.post(
  "/",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2]),
  createToggle
);
router.put(
  "/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2]),
  toggleToggle
);
router.delete(
  "/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2]),
  deleteToggle
);

export default router;
