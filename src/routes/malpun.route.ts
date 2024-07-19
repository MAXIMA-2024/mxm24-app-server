import {
  addTicketInternal,
  getTicketInternal,
} from "@/controllers/malpun.internal.controller";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import { Router } from "express";

const router = Router();

// Route Internal
router.post(
  "/internal",
  verifyJwt,
  verifyRole(["mahasiswa"]),
  addTicketInternal
);
router.get("/internal", getTicketInternal);

export default router;
