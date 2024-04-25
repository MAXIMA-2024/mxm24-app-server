import { Router } from "express";
import {
  dataVerifikasi,
  verifikasi,
} from "@/controllers/verifikasi.controller";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";

const router = Router();

router.get(
  "/",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2]),
  dataVerifikasi
);
// verifikasi
router.put(
  "/",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2]),
  verifikasi
);

export default router;
