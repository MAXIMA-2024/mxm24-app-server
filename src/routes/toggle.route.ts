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
router.get("/toggles", allToggles);
router.get("/toggles/:id", togglebyId);
router.post(
  "/toggles",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2]),
  createToggle
);
router.put(
  "/toggles/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2]),
  toggleToggle
);
router.delete(
  "/toggles/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2]),
  deleteToggle
);

export default router;
