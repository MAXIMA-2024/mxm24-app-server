import { Router } from "express";

import {
  ssoCallback,
  refresh,
  logout,
  profile,
} from "@/controllers/auth.controller";

import verifyJwt from "@/middlewares/verifyJwt.middleware";

const router = Router();

router.post("/sso", ssoCallback);
router.get("/refresh", refresh);
router.delete("/logout", verifyJwt, logout);

// self profile
router.get("/profile", verifyJwt, profile);

// onboarding
// !todo: kerjain onboarding

export default router;
