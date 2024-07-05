import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import { absenMalpun } from "@/controllers/absen.malpun.controller";

const router = Router();

router.put("/absen/", verifyJwt, verifyRole(["panitia"]), verifyDivisiPanitia([1, 2, 3, 4]), absenMalpun);

export default router;