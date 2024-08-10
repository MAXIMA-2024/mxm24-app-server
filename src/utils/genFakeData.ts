import { Faker, id_ID, fakerID_ID } from "@faker-js/faker";
import { type MahasiswaUpdatable } from "@/models/accounts/mahasiswa.model";
import db from "@/services/db";
import { nanoid } from "nanoid";

const faker = new Faker({
  locale: [id_ID],
});

const genRandomNim = () => {
  // 000000xxxxx
  return "00000" + Math.floor(Math.random() * 100000);
};

const genRandomBool = () => {
  return Math.random() < 0.5;
};

const genFakeMahasiswa = () => {
  return {
    name: faker.person.firstName() + " " + faker.person.lastName(),
    nim: genRandomNim(),
    email: faker.internet.email({
      provider: "student.umn.ac.id",
    }),
    angkatan: 2024,
    prodi: fakerID_ID.lorem.words(2),
    whatsapp: faker.string.numeric({
      length: 12,
      allowLeadingZeros: true,
    }),
    lineId: faker.internet.userName(),
    token: "MXM24-" + faker.string.numeric({ length: 6 }),
  };
};

await db.mahasiswa.createMany({
  data: Array.from({ length: 150 }, genFakeMahasiswa),
});

const stateId = await db.state.findMany({
  select: {
    id: true,
  },
});

const mahasiswas = await db.mahasiswa.findMany({
  select: {
    id: true,
  },
});

// randomize stateRegistration by assigning random stateId to each mahasiswa 3x
await Promise.all(
  Array.from({ length: 3 }).map(async () => {
    await db.stateRegistration.createMany({
      data: mahasiswas.map((mahasiswa) => {
        return {
          mahasiswaId: mahasiswa.id,
          stateId: stateId[Math.floor(Math.random() * stateId.length)].id,
          firstAttendance: false,
          lastAttendance: false,
        };
      }),
    });
  })
);

// malpun generator
await Promise.all(
  mahasiswas.map(async (mahasiswa) => {
    await db.malpunInternal.create({
      data: {
        mahasiswa: {
          connect: {
            id: mahasiswa.id,
          },
        },
        code: "MXM24-" + nanoid(16),
        alfagiftId: "99900" + nanoid(11),
      },
    });
  })
);
