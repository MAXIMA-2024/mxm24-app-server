import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import {
  getAllOrganisator,
  getOrganisator,
  updateOrganisator,
  deleteOrganisator,
} from "@/controllers/organisator.controller";
import { DivisiPanitia } from "@/models/divisiPanitia.model";

const router = Router();

router.get("/", verifyJwt, verifyRole(["panitia"]), getAllOrganisator);
router.get("/:id", verifyJwt, verifyRole(["panitia"]), getOrganisator);
router.put(
  "/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([
    DivisiPanitia.NOVATOR,
    DivisiPanitia.CHARTA,
    DivisiPanitia.ACTUS,
  ]),
  updateOrganisator
);
router.delete(
  "/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([
    DivisiPanitia.NOVATOR,
    DivisiPanitia.CHARTA,
    DivisiPanitia.ACTUS,
  ]),
  deleteOrganisator
);

export default router;
