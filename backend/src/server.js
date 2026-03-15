import express from 'express';
import cors from 'cors';
import { scanNetwork } from './scanner.js';
import { loadSettings, saveSettings } from './settings.js';
import { sendCommand, getDeviceStatus, configureMqtt } from './tasmota.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── Scan Network ──────────────────────────────────────────────
app.get('/api/scan', async (req, res) => {
  try {
    const settings = loadSettings();
    const devices = await scanNetwork(settings.scan, settings.auth);
    res.json({ success: true, devices });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Device Status ─────────────────────────────────────────────
app.get('/api/device/:ip/status', async (req, res) => {
  try {
    const settings = loadSettings();
    const status = await getDeviceStatus(req.params.ip, settings.auth);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Send Command to Device ────────────────────────────────────
app.post('/api/device/:ip/command', async (req, res) => {
  try {
    const { cmnd } = req.body;
    if (!cmnd) return res.status(400).json({ success: false, error: 'cmnd is required' });
    const settings = loadSettings();
    const result = await sendCommand(req.params.ip, cmnd, settings.auth);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Configure MQTT on Devices ─────────────────────────────────
app.post('/api/mqtt/configure', async (req, res) => {
  try {
    const { devices, mqtt } = req.body;
    if (!devices || !mqtt) {
      return res.status(400).json({ success: false, error: 'devices[] and mqtt{} are required' });
    }
    const settings = loadSettings();
    const results = await configureMqtt(devices, mqtt, settings.auth);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Settings ──────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  try {
    const settings = loadSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const updated = saveSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  🔍 TasmotaView Backend running on http://localhost:${PORT}\n`);
});
