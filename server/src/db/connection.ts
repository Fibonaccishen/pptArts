import Database from 'better-sqlite3';
import path from 'path';
import { config } from '../config.js';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(path.resolve(config.dbPath));
    db.pragma('journal_mode = WAL');
  }
  return db;
}
