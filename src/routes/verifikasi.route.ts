import { Router } from "express";

import {
  verifikasiPanitia,
  verifikasiOrganisator,
} from "@/controllers/verifikasi.controller";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";

const router = Router();

// verifikasi Panitia
router.put(
  "/verifikasiPanitia/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2]),
  verifikasiPanitia
);

// verifikasi Organisator
router.put(
  "/verifikasiOrganisator/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2]),
  verifikasiOrganisator
);

export default router;
