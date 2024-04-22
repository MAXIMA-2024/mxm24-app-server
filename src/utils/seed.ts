import db from "@/services/db";

await db.divisiPanitia.createMany({
  data: [
    { id: 1, name: "Novator (BPH)" },
    { id: 2, name: "Charta (Website)" },
    { id: 3, name: "Actus (Acara)" },
    { id: 4, name: "Scriptum (Registrasi)" },
    { id: 5, name: "Pipoca (Bazaar)" },
    { id: 6, name: "Venustus (Dekorasi)" },
    { id: 7, name: "Pictorium (Dokumentasi)" },
    { id: 8, name: "Proventus (Fresh Money)" },
    { id: 9, name: "Invictus (Keamanan dan Akomodasi)" },
    { id: 10, name: "Ligatura (Media Relation)" },
    { id: 11, name: "Mercimonia (Merchandise)" },
    { id: 12, name: "Scopus (Perlengkapan)" },
    { id: 13, name: "Epistula (Publikasi)" },
    { id: 14, name: "Aureus (Sponsorship)" },
    { id: 15, name: "Aspectus (Visual)" },
  ],
});

await db.day.createMany({
  data: [
    { id: 1, code: "D01", date: new Date("2024-04-15 10:00:00.0") },
    { id: 2, code: "D02", date: new Date("2024-04-16 10:00:00.0") },
    { id: 3, code: "D03", date: new Date("2024-04-17 10:00:00.000") },
    { id: 4, code: "D04", date: new Date("2024-04-18 10:00:00.000") },
    { id: 5, code: "D05", date: new Date("2024-04-19 10:00:00.000") },
  ],
});

// !todo: dummy STATE, yang beneran tunggu BPH

await db.state.createMany({
  data: [
    {
      dayId: 1,
      name: "ACES",
      quota: 100,
      location: "Lecture Theater",
      description: "Bogos Binted",
      logo: "-",
    },
    {
      dayId: 2,
      name: "Ikatan Bikers UMN",
      quota: 100,
      location: "Parkiran Gedung D",
      description: "Info sunmori ngab",
      logo: "-",
    },
    {
      dayId: 3,
      name: "HMIF",
      quota: 100,
      location: "B519",
      description: "info ngoding ngab",
      logo: "-",
    },
  ],
});
