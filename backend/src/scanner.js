/**
 * Network scanner – probes IP range for Tasmota devices via HTTP.
 * Sends "Status 0" to each IP; devices that respond with valid JSON are Tasmota devices.
 */

import { sendCommand } from './tasmota.js';

/**
 * Probe a single IP. Returns device info or null.
 */
async function probeIp(ip, auth, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Build URL inline so we can use the custom timeout
    let url = `http://${ip}/cm?cmnd=${encodeURIComponent('Status 0')}`;
    if (auth?.user) {
      url = `http://${ip}/cm?user=${encodeURIComponent(auth.user)}&password=${encodeURIComponent(auth.password || '')}&cmnd=${encodeURIComponent('Status 0')}`;
    }

    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) return null;

    const data = await resp.json();

    // Tasmota devices respond with StatusSTS, StatusFWR, StatusNET etc.
    if (!data.StatusFWR && !data.StatusNET && !data.Status) return null;

    return parseDevice(ip, data);
  } catch {
    return null; // timeout, connection refused, not a Tasmota device
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parse a Tasmota Status 0 response into a clean device object.
 */
function parseDevice(ip, data) {
  const status = data.Status || {};
  const fwr = data.StatusFWR || {};
  const net = data.StatusNET || {};
  const sts = data.StatusSTS || {};
  const log = data.StatusLOG || {};
  const mqt = data.StatusMQT || {};

  return {
    ip,
    deviceName: status.DeviceName || status.FriendlyName?.[0] || 'Unknown',
    friendlyName: status.FriendlyName || [],
    module: status.Module || 'Unknown',
    topic: status.Topic || '',
    firmware: fwr.Version || 'Unknown',
    buildDate: fwr.BuildDateTime || '',
    core: fwr.Core || '',
    sdk: fwr.SDK || '',
    hostname: net.Hostname || '',
    macAddress: net.Mac || '',
    ipAddress: net.IPAddress || ip,
    gateway: net.Gateway || '',
    ssid: sts.Wifi?.SSId || '',
    rssi: sts.Wifi?.RSSI || 0,
    signal: sts.Wifi?.Signal || 0,
    power: sts.POWER || sts.POWER1 || 'Unknown',
    uptime: sts.Uptime || '',
    mqttHost: mqt.MqttHost || '',
    mqttPort: mqt.MqttPort || 0,
    mqttUser: mqt.MqttUser || '',
    mqttClient: mqt.MqttClient || '',
    mqttCount: mqt.MqttCount || 0,
    mqttConnected: (mqt.MqttCount || 0) > 0,
    raw: data,
  };
}

/**
 * Scan a subnet for Tasmota devices.
 * @param {object} scanConfig - { subnet, rangeStart, rangeEnd, timeout, batchSize }
 * @param {object} auth - { user, password }
 * @returns {Promise<object[]>} Array of discovered devices
 */
export async function scanNetwork(scanConfig, auth) {
  const { subnet, rangeStart, rangeEnd, timeout, batchSize } = scanConfig;
  const ips = [];

  for (let i = rangeStart; i <= rangeEnd; i++) {
    ips.push(`${subnet}.${i}`);
  }

  const devices = [];

  // Process in batches to avoid overwhelming the network
  for (let i = 0; i < ips.length; i += batchSize) {
    const batch = ips.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((ip) => probeIp(ip, auth, timeout))
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        devices.push(result.value);
      }
    }
  }

  return devices;
}
