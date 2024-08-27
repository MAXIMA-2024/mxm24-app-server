import db from "../services/db";

const dataMaba = await db.dataMaba.findMany();
const mahasiswa = await db.mahasiswa.findMany({
  where: {
    email: {
      notIn: dataMaba.map((maba) => maba.email),
    },
  },
});

console.log("WHEN THE IMPOSTOR IS SUS!");
console.log(mahasiswa);
