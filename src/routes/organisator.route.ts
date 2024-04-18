import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import {
    getAllOrganisator,
    getOrganisator,
    updateOrganisator,
    deleteOrganisator
} from "@/controllers/organisator.controller";



const router = Router();

router.get("/", verifyJwt, verifyRole(["panitia"]), getAllOrganisator);
router.get("/:id", verifyJwt, verifyRole(["panitia"]), getOrganisator);
router.put("/:id", verifyJwt, verifyRole(["panitia"]), verifyDivisiPanitia([1,2]), updateOrganisator );
router.delete("/:id", verifyJwt, verifyRole(["panitia"]), verifyDivisiPanitia([1,2]), deleteOrganisator);


export default router;

