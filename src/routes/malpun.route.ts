import { Router } from "express";

import { addAccountExternal } from "@/controllers/malpun.controller";

const router = Router();

router.post("/external", addAccountExternal); //route malpun external

export default router;
