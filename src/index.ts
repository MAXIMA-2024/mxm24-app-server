import Express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import ENV from "@/utils/env";
import logging from "@/utils/logging";
import { notFound } from "@/utils/responses";

// [Route imports]
import indexRoute from "@/routes/index.route";
import authRoute from "@/routes/auth.route";
import stateRoute from "@/routes/state.route";

const app = Express();

// [CORS]
const allowedOrigins = [
  "https://internal.maximaumn.com",
  "https://maximaumn.com",
  "https://maxima.umn.ac.id",
];

// [Global Middlewares]
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials to be sent with requests
  })
);
app.use(Express.json());
app.use(
  "/public",
  Express.static(path.join(__dirname, "../public"), {
    extensions: ["png", "jpg", "jpeg", "webp"],
  })
);

// [Routes]
app.use(indexRoute);
app.use("/auth", authRoute);
app.use("/state", stateRoute);

// [Global 404]
app.all("*", (_req: Request, res: Response) => {
  return notFound(res, "Route not found");
});

// [Listener]
app.listen(ENV.APP_PORT, () => {
  logging("INFO", `Server running on ${ENV.APP_API_URL}`);
});
