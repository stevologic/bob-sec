// Database layer for Wizard's Sanctum
import Database from 'better-sqlite3';

const db = new Database('./wizard-sanctum.db');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT
  );
  
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );
`);

export function logToDB(page: string, action: string, details?: string) {
  const stmt = db.prepare(`INSERT INTO logs (page, action, details) VALUES (?, ?, ?)`);
  stmt.run(page, action, details);
  return true;
}

export function getSetting(key: string): string | null {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const result = stmt.get(key);
  return result ? result.value : null;
}

export function setSetting(key: string, value: string) {
  const stmt = db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`);
  stmt.run(key, value);
}

export function clearLogs() {
  db.exec('DELETE FROM logs');
}

// Close connection on module exit
process.on('exit', () => db.close());

export default db;
