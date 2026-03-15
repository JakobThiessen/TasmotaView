export interface TasmotaDevice {
  ip: string;
  deviceName: string;
  friendlyName: string[];
  module: string;
  topic: string;
  firmware: string;
  buildDate: string;
  core: string;
  sdk: string;
  hostname: string;
  macAddress: string;
  ipAddress: string;
  gateway: string;
  ssid: string;
  rssi: number;
  signal: number;
  power: string;
  uptime: string;
  mqttHost: string;
  mqttPort: number;
  mqttUser: string;
  mqttClient: string;
  mqttCount: number;
  mqttConnected: boolean;
  raw?: Record<string, unknown>;
}

export interface ScanConfig {
  subnet: string;
  rangeStart: number;
  rangeEnd: number;
  timeout: number;
  batchSize: number;
}

export interface AuthConfig {
  user: string;
  password: string;
}

export interface MqttConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export interface AppSettings {
  scan: ScanConfig;
  auth: AuthConfig;
  mqtt: MqttConfig;
}

export interface MqttConfigResult {
  ip: string;
  success: boolean;
  error?: string;
  result?: Record<string, unknown>;
}
