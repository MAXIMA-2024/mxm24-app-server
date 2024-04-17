import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import { 
    getAllPanitia,
    getPanitia,
    addPanitia,
    updatePanitia,
    deletePanitia,
    enumDivisiPanitia
 } from "@/controllers/panitia.controller";


const router = Router();

router.get("/", verifyJwt, verifyRole(["panitia"]), getAllPanitia);
router.get("/:id", verifyJwt, verifyRole(["panitia"]), getPanitia);
router.post("/", verifyJwt, verifyRole(["panitia"]), verifyDivisiPanitia([1,2]), addPanitia );
router.put("/:id", verifyJwt, verifyRole(["panitia"]), verifyDivisiPanitia([1,2]), updatePanitia );
router.delete("/:id", verifyJwt, verifyRole(["panitia"]), verifyDivisiPanitia([1,2]), deletePanitia);
router.get("/enum/divisiPanitia", enumDivisiPanitia);


export default router;

