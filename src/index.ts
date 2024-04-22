import Express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import ENV from "@/utils/env";
import logging from "@/utils/logging";
import { notFound } from "@/utils/responses";

// [Route imports]
import indexRoute from "@/routes/index.route";

const app = Express();

// [Global Middlewares]
app.use(cookieParser());
app.use(cors());
app.use(Express.json());

// [Routes]
app.use(indexRoute);

// [Global 404]
app.all("*", (_req: Request, res: Response) => {
  return notFound(res, "Route not found");
});

// [Listener]
app.listen(ENV.APP_PORT, () => {
  logging("INFO", `Server running on ${ENV.APP_API_URL}`);
});
