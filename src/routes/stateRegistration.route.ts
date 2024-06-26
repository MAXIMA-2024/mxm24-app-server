import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";
import { 
    getStateRegistration,
    addStateRegistration,
    deleteStateRegistration,
} from "@/controllers/stateRegistration.controller";

const router = Router();

router.get("/", verifyJwt, verifyRole(["mahasiswa"]), getStateRegistration);
router.post("/", verifyJwt, verifyRole(["mahasiswa"]), addStateRegistration);
router.delete("/:id", verifyJwt, verifyRole(["mahasiswa"]), deleteStateRegistration);

export default router;