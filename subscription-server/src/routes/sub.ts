import { Router } from "express";
import dbPromise from "../db";

const router = Router();

router.get("/:uuid", async (req, res) => {
  const db = await dbPromise;
  const { uuid } = req.params;
  const row = await db.get(
    "SELECT subString FROM SubscriptionRecord WHERE uuid = ?",
    uuid,
  );
  if (!row) {
    return res.status(404).send("Not Found");
  }
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(row.subString);
});

export default router;
