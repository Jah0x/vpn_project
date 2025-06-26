import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { join } from 'path';

const dbPath = process.env.DB_PATH || join(__dirname, '..', 'subs.db');

const dbPromise: Promise<Database> = open({
  filename: dbPath,
  driver: sqlite3.Database
}).then(async (db) => {
  await db.exec(`CREATE TABLE IF NOT EXISTS SubscriptionRecord (
    uuid TEXT PRIMARY KEY,
    subString TEXT NOT NULL
  )`);
  return db;
});

export default dbPromise;
