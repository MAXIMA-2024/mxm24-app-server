import { Router } from "express";

import {
  ssoCallback,
  refresh,
  logout,
  profile,
  profileUpdate,
  onboarding,
  organisatorLoginCode,
} from "@/controllers/auth.controller";

import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";

const router = Router();

// login via unique-code
router.post("/login-code", organisatorLoginCode);

router.post("/sso", ssoCallback);
router.get("/refresh", refresh);
router.delete("/logout", logout);

// self profile
router.get("/profile", verifyJwt, profile);
router.put("/profile", verifyJwt, verifyRole(["mahasiswa"]), profileUpdate);

// onboarding
router.post("/onboarding", verifyJwt, onboarding);

export default router;
