import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import {
  absenMalpun,
  checkForChatimeEligibility,
  ticketMalpunDetail,
} from "@/controllers/malpun.controller";
import {
  addTicketInternal,
  getTicketInternal,
} from "@/controllers/malpun.internal.controller";
import {
  addAccountExternal,
  midtransCallback,
} from "@/controllers/malpun.controller";
import { DivisiPanitia } from "@/models/divisiPanitia.model";

const router = Router();

// ticket detail by code
router.get("/ticket/:code", ticketMalpunDetail);

// absen route
router.put(
  "/absen",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([
    DivisiPanitia.NOVATOR,
    DivisiPanitia.CHARTA,
    DivisiPanitia.ACTUS,
    DivisiPanitia.SCRIPTUM,
  ]),
  absenMalpun
);

// Route Internal
router.post(
  "/internal",
  verifyJwt,
  verifyRole(["mahasiswa"]),
  addTicketInternal
);
router.get(
  "/internal",
  verifyJwt,
  verifyRole(["mahasiswa"]),
  getTicketInternal
);

// Route External
router.post("/external", addAccountExternal);
router.get("/external/checkChatime", checkForChatimeEligibility);
router.post("/external/callback", midtransCallback);

export default router;
