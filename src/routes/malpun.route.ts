import { Router } from "express";

import {
  addAccountExternal,
  midtransCallback,
} from "@/controllers/malpun.controller";

const router = Router();

router.post("/external", addAccountExternal); //route malpun external
router.post("/external/callback", midtransCallback); //route malpun external

export default router;
