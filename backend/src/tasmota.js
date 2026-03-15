/**
 * Tasmota HTTP command helpers.
 * All communication with Tasmota devices flows through these functions.
 */

const TIMEOUT = 3000;

function buildUrl(ip, cmnd, auth) {
  let url = `http://${ip}/cm?cmnd=${encodeURIComponent(cmnd)}`;
  if (auth?.user) {
    url = `http://${ip}/cm?user=${encodeURIComponent(auth.user)}&password=${encodeURIComponent(auth.password || '')}&cmnd=${encodeURIComponent(cmnd)}`;
  }
  return url;
}

async function fetchWithTimeout(url, timeoutMs = TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Send a single Tasmota command and return the JSON result.
 */
export async function sendCommand(ip, cmnd, auth) {
  const url = buildUrl(ip, cmnd, auth);
  return fetchWithTimeout(url);
}

/**
 * Get full status (Status 0) from a Tasmota device.
 */
export async function getDeviceStatus(ip, auth) {
  return sendCommand(ip, 'Status 0', auth);
}

/**
 * Configure MQTT on multiple devices using Backlog command.
 * Returns an array of { ip, success, error?, result? }.
 */
export async function configureMqtt(deviceIps, mqtt, auth) {
  const parts = [];
  if (mqtt.host) parts.push(`MqttHost ${mqtt.host}`);
  if (mqtt.port) parts.push(`MqttPort ${mqtt.port}`);
  if (mqtt.user !== undefined) parts.push(`MqttUser ${mqtt.user}`);
  if (mqtt.password !== undefined) parts.push(`MqttPassword ${mqtt.password}`);

  if (parts.length === 0) {
    throw new Error('No MQTT parameters provided');
  }

  const backlogCmd = `Backlog ${parts.join('; ')}`;

  const results = await Promise.allSettled(
    deviceIps.map(async (ip) => {
      try {
        const result = await sendCommand(ip, backlogCmd, auth);
        return { ip, success: true, result };
      } catch (err) {
        return { ip, success: false, error: err.message };
      }
    })
  );

  return results.map((r) => (r.status === 'fulfilled' ? r.value : { ip: '?', success: false, error: r.reason?.message }));
}
