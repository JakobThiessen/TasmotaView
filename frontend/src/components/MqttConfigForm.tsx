import { useState } from 'react';
import type { MqttConfig, MqttConfigResult } from '../types';
import { configureMqttOnDevices } from '../api';

interface Props {
  selectedIps: string[];
  currentMqtt: MqttConfig;
}

export default function MqttConfigForm({ selectedIps, currentMqtt }: Props) {
  const [host, setHost] = useState(currentMqtt.host);
  const [port, setPort] = useState(currentMqtt.port || 1883);
  const [user, setUser] = useState(currentMqtt.user);
  const [password, setPassword] = useState(currentMqtt.password);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MqttConfigResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIps.length === 0) {
      setError('Bitte wähle mindestens ein Gerät aus.');
      return;
    }
    if (!host) {
      setError('MQTT-Host ist erforderlich.');
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await configureMqttOnDevices(selectedIps, { host, port, user, password });
      setResults(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Konfiguration fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">MQTT-Broker konfigurieren</h2>

      {selectedIps.length === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
          ⚠️ Wähle auf dem Dashboard Geräte aus, auf denen MQTT konfiguriert werden soll.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MQTT Host / IP</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="z.B. 192.168.178.50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benutzer</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || selectedIps.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Konfiguriere...
              </span>
            ) : (
              `Auf ${selectedIps.length} Gerät(e) anwenden`
            )}
          </button>
          {selectedIps.length > 0 && (
            <span className="text-sm text-gray-500">
              {selectedIps.length} Gerät(e) ausgewählt
            </span>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          ❌ {error}
        </div>
      )}

      {results && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">Ergebnisse:</h3>
          {results.map((r) => (
            <div
              key={r.ip}
              className={`p-2 text-sm rounded-lg ${
                r.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              <span className="font-mono">{r.ip}</span>:{' '}
              {r.success ? '✅ Erfolgreich konfiguriert' : `❌ ${r.error}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
