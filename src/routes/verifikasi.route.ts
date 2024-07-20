import { Router } from "express";
import {
  dataVerifikasi,
  verifikasi,
} from "@/controllers/verifikasi.controller";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import { DivisiPanitia } from "@/models/divisiPanitia.model";

const router = Router();

router.get(
  "/",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([DivisiPanitia.NOVATOR, DivisiPanitia.CHARTA]),
  dataVerifikasi
);
// verifikasi
router.put(
  "/",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([DivisiPanitia.NOVATOR, DivisiPanitia.CHARTA]),
  verifikasi
);

export default router;
