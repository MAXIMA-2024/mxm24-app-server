import logging from "@/utils/logging";

const envs = [
  "NODE_ENV",
  "APP_PORT",
  "APP_JWT_SECRET",
  "APP_JWT_REFRESH_SECRET",
  "APP_DB_URL",
  "APP_API_URL",
  "APP_FRONTEND_URL",
  "APP_MQ_URL",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
];

envs.forEach((env) => {
  if (!process.env[env]) {
    logging("ERROR", `Environment variable ${env} is not defined`);
    process.exit(1);
  }
});

if (!Bun.env.MIDTRANS_SERVER_KEY) {
  logging("ERROR", "MIDTRANS_SERVER_KEY not set");
  process.exit(-1);
}

if (!Bun.env.MIDTRANS_ENV) {
  logging("WARN", "MIDTRANS_ENV not set, using default sandbox");
}

const ENV = {
  NODE_ENV: Bun.env.NODE_ENV || "development",
  APP_PORT: Number(Bun.env.APP_PORT) || 8080,
  APP_JWT_SECRET: Bun.env.APP_JWT_SECRET || "chipichipichapachapa",
  APP_JWT_REFRESH_SECRET: Bun.env.APP_JWT_REFRESH_SECRET || "dubidubidabadaba",
  APP_DB_URL: Bun.env.APP_DB_URL || "mysql://root@localhost:3306/mxm24_db",
  APP_API_URL: Bun.env.APP_API_URL || "http://localhost:8080",
  APP_FRONTEND_URL: Bun.env.APP_FRONTEND_URL || "http://localhost:5173",
  APP_MQ_URL: Bun.env.APP_MQ_URL || "http://localhost:8085/mail",
  R2_ACCOUNT_ID: Bun.env.R2_ACCOUNT_ID || "R2_ACCOUNT_ID",
  R2_ACCESS_KEY_ID: Bun.env.R2_ACCESS_KEY_ID || "R2_ACCESS_KEY_ID",
  R2_SECRET_ACCESS_KEY: Bun.env.R2_SECRET_ACCESS_KEY || "R2_SECRET_ACCESS_KEY",
  R2_BUCKET_NAME: Bun.env.R2_BUCKET_NAME || "R2_BUCKET_NAME",
  R2_PUBLIC_URL: Bun.env.R2_PUBLIC_URL || "R2_PUBLIC_URL",
  MIDTRANS_SERVER_KEY: Bun.env.MIDTRANS_SERVER_KEY || "midtrans",
  MIDTRANS_ENV: Bun.env.MIDTRANS_ENV || "sandbox",
};

export default ENV;
