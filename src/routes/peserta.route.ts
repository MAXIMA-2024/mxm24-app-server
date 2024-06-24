import { Router } from "express";
import verifyJwt from "@/middlewares/verifyJwt.middleware";
import verifyDivisiPanitia from "@/middlewares/verifyDivisiPanitia.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";

import {
  deleteMahasiswa,
  getAllMahasiswa,
  getAllPesertaMalpun,
  getSingleMahasiswa,
  updateMahasiswa,
} from "@/controllers/peserta.controller";

const router = Router();

router.get("/mahasiswa", verifyJwt, verifyRole(["panitia"]), getAllMahasiswa);
router.get(
  "/mahasiswa/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  getSingleMahasiswa
);
router.put(
  "/mahasiswa/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  /* 
    divisi yang berwenang untuk update/delete data mahasiswa
    [1, 2, 3, 4, 13]

    1: novator
    2: charta
    3: actus
    4: scriptum
    13: epistula

    pr disini gue masukkin biar mandiri :) jadi kalo ada laporan salah input nama/nim/segala macem, mereka bisa fix sendiri
  */
  verifyDivisiPanitia([1, 2, 3, 4, 13]),
  updateMahasiswa
);
router.delete(
  "/mahasiswa/:id",
  verifyJwt,
  verifyRole(["panitia"]),
  verifyDivisiPanitia([1, 2, 3, 4, 13]),
  deleteMahasiswa
);

router.get("/malpun", verifyJwt, verifyRole(["panitia"]), getAllPesertaMalpun);

export default router;
