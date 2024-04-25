import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import { dashboardStatistics } from "@/controllers/dashboard.controller";

const router = Router();


router.get("/", verifyJwt, verifyRole(["panitia"]), dashboardStatistics);


export default router;