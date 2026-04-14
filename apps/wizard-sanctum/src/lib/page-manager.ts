// Page routing for Wizard's Sanctum
import type { NextPageContext } from 'next';
import db from './db';

const PAGE_TYPES = {
  OFFICE: 'office',
  ORACLE: 'oracle',
  WISE_ONE: 'wise_one',
  CONFIGURATIONS: 'configurations',
};

// Initialize page for wizard-sanctum
export async function initializePage(page: string): Promise<void> {
  await db.setSetting('page', page);
  
  // Log page initialization
  await logToDB('wizard-sanctum', 'page_init', `Initialized ${page}`);
}

// Log page action
export async function logPageAction(page: string, action: string, details?: string) {
  await logToDB(page, action, details);
}

// Get page settings
export async function getPageSettings(page: string) {
  const pageName = page.replace('_', ' ');
  const allSettings = db.prepare('SELECT key, value FROM settings WHERE key LIKE ?')
    .bind(`%${pageName}%`)
    .all();
  return allSettings.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

// Set page setting
export async function setPageSetting(page: string, key: string, value: string) {
  await db.setSetting(key, value);
  await logToDB(page, 'setting_update', `Set ${key} = ${value}`);
}

// Get all logs for a page
export async function getLogs(page: string, limit: number = 100) {
  const logs = db.prepare('SELECT * FROM logs WHERE page = ? ORDER BY timestamp DESC LIMIT ?')
    .bind(page, limit)
    .all();
  return logs;
}

// Clear page logs
export async function clearLogs() {
  await db.clearLogs();
}

// Export page type for Next.js routing
export default function wizardSanctumPage(page: string) {
  return { page };
}
