import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import {
  absenMalpun,
  ticketMalpunDetail,
} from "@/controllers/malpun.controller";

const router = Router();

// ticket detail by code
router.get("/ticket/:code", ticketMalpunDetail);

// absen route
router.put(
  "/absen",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2, 3, 4]),
  absenMalpun
);

export default router;
