import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import MqttConfigForm from '../components/MqttConfigForm';
import type { MqttConfig } from '../types';

export default function MqttPage() {
  const { devices, settings, loadSettings } = useAppContext();
  const [selectedIps, setSelectedIps] = useState<string[]>(devices.map((d) => d.ip));

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const defaultMqtt: MqttConfig = settings?.mqtt || { host: '', port: 1883, user: '', password: '' };

  function handleToggle(ip: string) {
    setSelectedIps((prev) => (prev.includes(ip) ? prev.filter((i) => i !== ip) : [...prev, ip]));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MQTT Konfiguration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Konfiguriere den MQTT-Broker auf deinen Tasmota-Geräten (Mosquitto)
        </p>
      </div>

      <MqttConfigForm selectedIps={selectedIps} currentMqtt={defaultMqtt} />

      {devices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Geräteauswahl:</h3>
          <div className="space-y-2">
            {devices.map((d) => (
              <label key={d.ip} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIps.includes(d.ip)}
                  onChange={() => handleToggle(d.ip)}
                  className="rounded border-gray-300"
                />
                <span className="font-mono text-sm">{d.ip}</span>
                <span className="text-sm text-gray-600">{d.deviceName}</span>
                {d.mqttHost && (
                  <span className="text-xs text-gray-400">
                    (aktuell: {d.mqttHost}:{d.mqttPort})
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {devices.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800 text-sm">
          ⚠️ Keine Geräte geladen. Gehe zum{' '}
          <a href="/" className="underline font-medium">
            Dashboard
          </a>{' '}
          und starte zuerst einen Netzwerk-Scan.
        </div>
      )}
    </div>
  );
}
