import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import {
  getAllPanitia,
  getPanitia,
  updatePanitia,
  deletePanitia,
  enumDivisiPanitia,
} from "@/controllers/panitia.controller";
import { DivisiPanitia } from "@/models/divisiPanitia.model";

const router = Router();

router.get("/", verifyJwt, verifyRole(["panitia"]), getAllPanitia);
router.get("/:id", verifyJwt, verifyRole(["panitia"]), getPanitia);
router.put(
  "/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([DivisiPanitia.NOVATOR, DivisiPanitia.CHARTA]),
  updatePanitia
);
router.delete(
  "/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([DivisiPanitia.NOVATOR, DivisiPanitia.CHARTA]),
  deletePanitia
);
router.get("/enum/divisiPanitia", enumDivisiPanitia);

export default router;
