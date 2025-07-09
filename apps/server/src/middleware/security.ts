import rateLimit from "express-rate-limit";
import helmet from "helmet";

export const securityMiddlewares = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'", "https://telegram.org"], // allow Telegram SDK
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) =>
      req.path.startsWith("/metrics") || req.path.startsWith("/health"),
  }),
];
