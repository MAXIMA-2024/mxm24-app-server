# mxm24-app-server

Backend for MAXIMA 2024 website, brought to you by Charta.

### Coordinators

- [00000068083 - Albert Tirto Kusumo✨](https://github.com/AlbertTech23)
- [00000069524 - Muhammad Fathan Ridhwan🏭](https://github.com/rdhwan)

### Members

- [00000068930 - Dimas Takeda Wukir Tirtowidjojo✨](https://github.com/Exosuit)
- [00000069115 - Alvin Yohanes Kristianto🏭](https://github.com/JunHengker)
- [00000070288 - Paskasius Gian Avila Putra✨](https://github.com/GianAv23)
- [00000070515 - Michael Tio🏭](https://github.com/michaeltio)
- [00000073191 - Hafizh Kumara Widyadhana🏭](https://github.com/FizKw)
- [00000083560 - Godwin Gilbert Woisiri✨](https://github.com/ouin40)
- [00000092186 - Nikolas Bentus Karya✨](https://github.com/NikBent)

✨: frontend, 🏭: backend

### Tech Used

- [Bun](https://bun.sh/)
- [Express](https://github.com/expressjs/express)
- [Prisma](https://github.com/prisma/prisma)

### Development

To install dependencies:

```bash
bun install
```

To migrate database, run:

```bash
bun run db:migrate
bun run db:seed
```

Then run the development server:

```bash
bun run dev
```

### Production

To install dependencies:

```bash
bun install
```

To push database, run:

```bash
bun run db:push
bun run db:seed
```

To run in production:

```bash
bun run start
```

This project was created using `bun init` in bun v1.1.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
