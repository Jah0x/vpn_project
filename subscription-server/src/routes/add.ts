import { Router } from 'express';
import dbPromise from '../db';

const router = Router();

router.post('/add', async (req, res) => {
  const { uuid, subString } = req.body || {};
  if (typeof uuid !== 'string' || typeof subString !== 'string') {
    return res.status(400).json({ error: 'Invalid body' });
  }
  const db = await dbPromise;
  await db.run(
    `INSERT INTO SubscriptionRecord (uuid, subString) VALUES (?, ?) 
     ON CONFLICT(uuid) DO UPDATE SET subString=excluded.subString`,
    uuid,
    subString
  );
  // TODO: добавить HMAC или token-auth
  res.status(200).end();
});

export default router;
