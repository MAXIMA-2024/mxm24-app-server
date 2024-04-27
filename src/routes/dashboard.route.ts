import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import {
  dashboardOrganisator,
  dashboardStatistics,
} from "@/controllers/dashboard.controller";

const router = Router();

router.get("/panitia", verifyJwt, verifyRole(["panitia"]), dashboardStatistics);
router.get(
  "/organisator",
  verifyJwt,
  verifyRole(["organisator"]),
  dashboardOrganisator
);

export default router;
