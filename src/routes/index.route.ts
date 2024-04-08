import { Router } from "express";
import { index } from "@/controllers/index.controller";

const router = Router();

router.get("/", index);

export default router;
