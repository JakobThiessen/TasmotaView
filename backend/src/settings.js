import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = join(__dirname, '..', 'data', 'settings.json');

const DEFAULTS = {
  scan: { subnet: '192.168.178', rangeStart: 1, rangeEnd: 254, timeout: 1500, batchSize: 30 },
  auth: { user: 'admin', password: '' },
  mqtt: { host: '', port: 1883, user: '', password: '' },
};

export function loadSettings() {
  try {
    const raw = readFileSync(SETTINGS_PATH, 'utf-8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(updates) {
  const current = loadSettings();
  const merged = {
    scan: { ...current.scan, ...updates.scan },
    auth: { ...current.auth, ...updates.auth },
    mqtt: { ...current.mqtt, ...updates.mqtt },
  };
  writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}
