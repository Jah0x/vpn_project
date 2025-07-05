import express from "express";
import cors from "cors";
import { mountSwagger } from "./swagger";
import pino from "pino";
import pinoHttp from "pino-http";
import { securityMiddlewares } from "./middleware/security";
import { hostFilterMiddleware } from "./middleware/hostFilter";
import { register } from "./metrics";
import { metricsMiddleware } from "./metricsMiddleware";
import vpnRouter from "./vpn";
import authRouter from "./authRoutes";
import authPasswordRouter from "./routes/authPassword";
import linkTelegramRouter from "./routes/linkTelegram";
import configRouter from "./configRoutes";
import onramperRouter from "./onramper";
import subscriptionLinkRouter from "./subscriptionLink";
import auditRouter from "./auditRoutes";
import adminPlansRouter from "./routes/admin/plans";
import plansRouter from "./routes/plans";
import publicPlansRouter from "./routes/publicPlans";
import cron from "node-cron";
import { retrySubPushQueue } from "./lib/subPush";

export const app = express();

const logger = pino({ level: "info" });
app.use(pinoHttp({ logger }));

app.use(cors());
app.use("/api/pay/onramper/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(hostFilterMiddleware);
securityMiddlewares.forEach((mw) => app.use(mw));

app.use(metricsMiddleware);
mountSwagger(app);

app.get("/", (_req, res) => {
  res.send("OK");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/api/auth", authRouter);
app.use("/api/auth", authPasswordRouter);
app.use("/api/auth/link/telegram", linkTelegramRouter);
app.use("/api/vpn", vpnRouter);
app.use("/api", configRouter);
app.use("/api/pay/onramper", onramperRouter);
app.use("/api", subscriptionLinkRouter);
app.use("/api", auditRouter);
app.use("/api/plans", plansRouter);
app.use("/api/admin/plans", adminPlansRouter);

cron.schedule("*/5 * * * *", () => {
  retrySubPushQueue().catch((err) => console.error("subPush retry error", err));
});
