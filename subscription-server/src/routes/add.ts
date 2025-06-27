import { Router } from "express";
import dbPromise from "../db";
import crypto from "crypto";

const router = Router();

router.post("/add", async (req, res) => {
  const { uuid, subString } = req.body || {};
  const signature = req.header("X-Signature") || "";
  const body = JSON.stringify({ uuid, subString });
  const expected = crypto
    .createHmac("sha256", process.env.SUB_PUSH_SECRET || "")
    .update(body)
    .digest("hex");
  if (signature !== expected) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  if (typeof uuid !== "string" || typeof subString !== "string") {
    return res.status(400).json({ error: "Invalid body" });
  }
  const db = await dbPromise;
  await db.run(
    `INSERT INTO SubscriptionRecord (uuid, subString) VALUES (?, ?) 
     ON CONFLICT(uuid) DO UPDATE SET subString=excluded.subString`,
    uuid,
    subString,
  );
  res.status(200).end();
});

export default router;
