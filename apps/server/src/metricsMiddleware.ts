import { RequestHandler } from "express";
import { httpRequestsTotal, httpRequestDurationSeconds } from "./metrics";

export const metricsMiddleware: RequestHandler = (req, res, next): void => {
  const start = process.hrtime();
  res.on("finish", () => {
    const [sec, nano] = process.hrtime(start);
    const duration = sec + nano / 1e9;
    const labels = {
      method: req.method,
      path: req.path,
      status: String(res.statusCode),
    };
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, duration);
  });
  next();
}
