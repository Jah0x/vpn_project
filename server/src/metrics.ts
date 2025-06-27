import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client";

export const register = new Registry();
collectDefaultMetrics({ register });

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"] as const,
});

export const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path", "status"] as const,
});

export const dbQueryDurationSeconds = new Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of DB queries in seconds",
  labelNames: ["model", "action"] as const,
});

export const stripeWebhookTotal = new Counter({
  name: "stripe_webhook_total",
  help: "Count of received Stripe webhook events",
  labelNames: ["event"] as const,
});

export const auditLogsTotal = new Counter({
  name: "audit_logs_total",
  help: "Number of audit log entries created",
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(dbQueryDurationSeconds);
register.registerMetric(stripeWebhookTotal);
register.registerMetric(auditLogsTotal);
