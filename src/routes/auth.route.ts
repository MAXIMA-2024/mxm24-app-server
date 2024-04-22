import { Router } from "express";

import {
  ssoCallback,
  refresh,
  logout,
  profile,
  onboarding,
} from "@/controllers/auth.controller";

import verifyJwt from "@/middlewares/verifyJwt.middleware";

const router = Router();

router.post("/sso", ssoCallback);
router.get("/refresh", refresh);
router.delete("/logout", logout);

// self profile
router.get("/profile", verifyJwt, profile);

// onboarding
router.post("/onboarding", verifyJwt, onboarding);

export default router;