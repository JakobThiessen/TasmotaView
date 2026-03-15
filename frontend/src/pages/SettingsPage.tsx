import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { updateSettings } from '../api';
import type { AppSettings } from '../types';

export default function SettingsPage() {
  const { settings, loadSettings, setSettings } = useAppContext();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [subnet, setSubnet] = useState('192.168.178');
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(254);
  const [timeout, setTimeout_] = useState(1500);
  const [batchSize, setBatchSize] = useState(30);
  const [authUser, setAuthUser] = useState('admin');
  const [authPassword, setAuthPassword] = useState('');
  const [mqttHost, setMqttHost] = useState('');
  const [mqttPort, setMqttPort] = useState(1883);
  const [mqttUser, setMqttUser] = useState('');
  const [mqttPassword, setMqttPassword] = useState('');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      setSubnet(settings.scan.subnet);
      setRangeStart(settings.scan.rangeStart);
      setRangeEnd(settings.scan.rangeEnd);
      setTimeout_(settings.scan.timeout);
      setBatchSize(settings.scan.batchSize);
      setAuthUser(settings.auth.user);
      setAuthPassword(settings.auth.password);
      setMqttHost(settings.mqtt.host);
      setMqttPort(settings.mqtt.port);
      setMqttUser(settings.mqtt.user);
      setMqttPassword(settings.mqtt.password);
    }
  }, [settings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const newSettings: AppSettings = {
        scan: { subnet, rangeStart, rangeEnd, timeout, batchSize },
        auth: { user: authUser, password: authPassword },
        mqtt: { host: mqttHost, port: mqttPort, user: mqttUser, password: mqttPassword },
      };
      const updated = await updateSettings(newSettings);
      setSettings(updated);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-sm text-gray-500 mt-1">Scan-Bereich, Authentifizierung & MQTT-Defaults</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Scan Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">🔍 Netzwerk-Scan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subnetz</label>
              <input
                type="text"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                placeholder="192.168.178"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Von IP</label>
              <input
                type="number"
                min={1}
                max={254}
                value={rangeStart}
                onChange={(e) => setRangeStart(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bis IP</label>
              <input
                type="number"
                min={1}
                max={254}
                value={rangeEnd}
                onChange={(e) => setRangeEnd(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</label>
              <input
                type="number"
                min={500}
                max={10000}
                step={100}
                value={timeout}
                onChange={(e) => setTimeout_(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch-Größe</label>
              <input
                type="number"
                min={5}
                max={100}
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Auth Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">🔐 Tasmota Authentifizierung</h2>
          <p className="text-sm text-gray-500 mb-4">
            Falls deine Tasmota-Geräte passwortgeschützt sind
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benutzer</label>
              <input
                type="text"
                value={authUser}
                onChange={(e) => setAuthUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="leer = kein Passwort"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Default MQTT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">📡 Standard MQTT-Einstellungen</h2>
          <p className="text-sm text-gray-500 mb-4">
            Werden als Vorauswahl im MQTT-Konfigurationsformular verwendet
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MQTT Host</label>
              <input
                type="text"
                value={mqttHost}
                onChange={(e) => setMqttHost(e.target.value)}
                placeholder="z.B. 192.168.178.50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={mqttPort}
                onChange={(e) => setMqttPort(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benutzer</label>
              <input
                type="text"
                value={mqttUser}
                onChange={(e) => setMqttUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
              <input
                type="password"
                value={mqttPassword}
                onChange={(e) => setMqttPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? 'Speichere...' : '💾 Einstellungen speichern'}
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium animate-pulse">
              ✅ Gespeichert!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
