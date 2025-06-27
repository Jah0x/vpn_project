import express from "express";
import subRoute from "./routes/sub";
import addRoute from "./routes/add";
import "../src/db";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/", addRoute);
  app.use("/", subRoute);
  return app;
}

if (require.main === module) {
  const port = process.env.PORT || 8080;
  createApp().listen(port, () => {
    console.log(`Subscription server listening on ${port}`);
  });
}
