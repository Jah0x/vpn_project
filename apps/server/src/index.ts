import dotenv from "dotenv";
dotenv.config();
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[WARN] STRIPE_SECRET_KEY is not set; Stripe features disabled");
}
// Выводим токен в логах для проверки доступности переменных окружения
console.log(`TELEGRAM_BOT_TOKEN=${process.env.TELEGRAM_BOT_TOKEN}`);

import { app } from "./server";
import publicPlansRouter from "./routes/publicPlans";

const PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 8080;

app.use("/api/public", publicPlansRouter);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Set SERVER_PORT to a free port or stop the conflicting process.`
    );
    process.exit(1);
  }
  throw err;
});
