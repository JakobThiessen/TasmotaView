import { AppSettings, MqttConfig, MqttConfigResult, TasmotaDevice } from '../types';

const BASE = '/api';

export async function fetchScan(): Promise<TasmotaDevice[]> {
  const res = await fetch(`${BASE}/scan`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Scan failed');
  return json.devices;
}

export async function fetchDeviceStatus(ip: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/device/${ip}/status`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Status failed');
  return json.status;
}

export async function sendDeviceCommand(ip: string, cmnd: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/device/${ip}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmnd }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Command failed');
  return json.result;
}

export async function configureMqttOnDevices(
  devices: string[],
  mqtt: MqttConfig
): Promise<MqttConfigResult[]> {
  const res = await fetch(`${BASE}/mqtt/configure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ devices, mqtt }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'MQTT config failed');
  return json.results;
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await fetch(`${BASE}/settings`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Settings load failed');
  return json.settings;
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const res = await fetch(`${BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Settings save failed');
  return json.settings;
}
