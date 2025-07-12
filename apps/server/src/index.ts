import { logger } from "./lib/logger";
import dotenv from "dotenv";
dotenv.config();
if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn("[WARN] STRIPE_SECRET_KEY is not set; Stripe features disabled");
}
// Выводим токен частично для проверки доступности переменных окружения
const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
logger.info({ TELEGRAM_BOT_TOKEN: botToken.slice(0, 4) + "…" }, "env loaded");

import { app } from "./server";
import publicPlansRouter from "./routes/publicPlans";

const PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 8080;

app.use("/api/public", publicPlansRouter);

const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    logger.error(
      `Port ${PORT} is already in use. Set SERVER_PORT to a free port or stop the conflicting process.`
    );
    process.exit(1);
  }
  throw err;
});
