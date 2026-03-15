import type { TasmotaDevice } from '../types';
import { Link } from 'react-router-dom';

interface Props {
  devices: TasmotaDevice[];
  selectedIps: string[];
  onToggleSelect: (ip: string) => void;
  onSelectAll: () => void;
}

function RssiBar({ rssi }: { rssi: number }) {
  const pct = Math.max(0, Math.min(100, rssi));
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500">{rssi}%</span>
    </div>
  );
}

function MqttBadge({ connected, host }: { connected: boolean; host: string }) {
  if (!host) {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">Nicht konfiguriert</span>;
  }
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full ${
        connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {host}
    </span>
  );
}

export default function DeviceTable({ devices, selectedIps, onToggleSelect, onSelectAll }: Props) {
  if (devices.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Keine Geräte gefunden</p>
        <p className="text-sm mt-1">Starte einen Netzwerk-Scan um Tasmota-Geräte zu finden.</p>
      </div>
    );
  }

  const allSelected = devices.length > 0 && selectedIps.length === devices.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Gerät
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              IP-Adresse
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Hostname
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Firmware
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              WLAN
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              MQTT
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Power
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Uptime
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {devices.map((d) => (
            <tr key={d.ip} className="hover:bg-blue-50 transition-colors">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIps.includes(d.ip)}
                  onChange={() => onToggleSelect(d.ip)}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-4 py-3">
                <Link to={`/device/${d.ip}`} className="text-blue-600 hover:text-blue-800 font-medium">
                  {d.deviceName}
                </Link>
                <div className="text-xs text-gray-400">{d.module}</div>
              </td>
              <td className="px-4 py-3 font-mono text-sm flex items-center gap-1.5">
                {d.ip}
                <a
                  href={`http://${d.ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Tasmota-Webinterface öffnen"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{d.hostname || '-'}</td>
              <td className="px-4 py-3 text-sm">{d.firmware}</td>
              <td className="px-4 py-3">
                <div className="text-sm">{d.ssid}</div>
                <RssiBar rssi={d.rssi} />
              </td>
              <td className="px-4 py-3">
                <MqttBadge connected={d.mqttConnected} host={d.mqttHost} />
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    d.power === 'ON' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {d.power}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{d.uptime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
