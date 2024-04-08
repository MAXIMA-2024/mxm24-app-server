import logging from "@/utils/logging";

if (!Bun.env.APP_PORT) {
  logging("WARN", "APP_PORT not set, using default 8080");
}

if (!Bun.env.APP_JWT_SECRET) {
  logging("ERROR", "APP_JWT_SECRET not set in .env");
  process.exit(-1);
}

if (!Bun.env.APP_JWT_REFRESH_SECRET) {
  logging("ERROR", "APP_JWT_REFRESH_SECRET not set in .env");
  process.exit(-1);
}

if (!Bun.env.APP_DB_URL) {
  logging("ERROR", "APP_DB_URL not set in .env");
  process.exit(-1);
}

if (!Bun.env.APP_API_URL) {
  logging("WARN", "APP_API_URL not set, using default http://localhost:8080");
}

if (!Bun.env.APP_FRONTEND_URL) {
  logging(
    "WARN",
    "APP_FRONTEND_URL not set, using default http://localhost:5173"
  );
}

const ENV = {
  NODE_ENV: Bun.env.NODE_ENV || "development",
  APP_PORT: Number(Bun.env.APP_PORT) || 8080,
  APP_JWT_SECRET: Bun.env.APP_JWT_SECRET || "chipichipichapachapa",
  APP_JWT_REFRESH_SECRET: Bun.env.APP_JWT_REFRESH_SECRET || "dubidubidabadaba",
  APP_DB_URL: Bun.env.APP_DB_URL || "mysql://root@localhost:3306/mxm24_db",
  APP_API_URL: Bun.env.APP_API_URL || "http://localhost:8080",
  APP_FRONTEND_URL: Bun.env.APP_FRONTEND_URL || "http://localhost:5173",
};

export default ENV;
