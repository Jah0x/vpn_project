import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import { mountSwagger } from "./swagger";
import { logger } from "./lib/logger";
import { loggingMiddleware } from "./middleware/logger";
import { securityMiddlewares } from "./middleware/security";
import { hostFilterMiddleware } from "./middleware/hostFilter";
import { register } from "./metrics";
import { metricsMiddleware } from "./metricsMiddleware";
import vpnRouter from "./vpn";
import authRouter from "./authRoutes";
import authPasswordRouter from "./routes/authPassword";
import combinedAuthRouter from "./routes/auth";
import linkTelegramRouter from "./routes/linkTelegram";
import hankoAuthRouter from "./routes/auth/hanko";
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

app.use(loggingMiddleware);

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

app.get("/healthz", (_req, res) => {
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
app.use("/api/auth", combinedAuthRouter);
app.use("/api/auth/hanko", hankoAuthRouter);
app.use("/api/auth/link/telegram", linkTelegramRouter);
app.use("/api/vpn", vpnRouter);
app.use("/api", configRouter);
app.use("/api/pay/onramper", onramperRouter);
app.use("/api", subscriptionLinkRouter);
app.use("/api", auditRouter);
app.use("/api/plans", plansRouter);
app.use("/api/admin/plans", adminPlansRouter);

// Middleware для логирования необработанных ошибок
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  (req as any).log.error(err);
  res.status(500).json({
    error: err?.message || "Internal Server Error",
    stack: err?.stack,
    route: req.originalUrl,
    requestId: (req as any).id,
  });
};
app.use(errorHandler);

cron.schedule("*/5 * * * *", () => {
  retrySubPushQueue().catch((err) => console.error("subPush retry error", err));
});
