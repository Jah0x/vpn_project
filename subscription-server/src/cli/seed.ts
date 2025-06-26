import fs from 'fs';
import path from 'path';
import dbPromise from '../db';

async function seed() {
  const file = path.join(__dirname, '..', '..', 'seed.json');
  const content = fs.readFileSync(file, 'utf-8');
  const records: { uuid: string; subString: string }[] = JSON.parse(content);
  const db = await dbPromise;
  for (const r of records) {
    await db.run(
      `INSERT INTO SubscriptionRecord (uuid, subString) VALUES (?, ?) 
       ON CONFLICT(uuid) DO UPDATE SET subString=excluded.subString`,
      r.uuid,
      r.subString
    );
  }
  console.log('Seed completed');
}

seed();
