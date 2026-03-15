import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDeviceStatus, sendDeviceCommand } from '../api';

export default function DeviceDetail() {
  const { ip } = useParams<{ ip: string }>();
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cmd, setCmd] = useState('');
  const [cmdResult, setCmdResult] = useState<string | null>(null);

  useEffect(() => {
    if (!ip) return;
    setLoading(true);
    fetchDeviceStatus(ip)
      .then(setStatus)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ip]);

  async function handleCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!ip || !cmd.trim()) return;
    try {
      const result = await sendDeviceCommand(ip, cmd);
      setCmdResult(JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      setCmdResult(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        ❌ Fehler: {error}
      </div>
    );
  }

  const s = status as Record<string, Record<string, unknown>> | null;
  const statusInfo = s?.Status as Record<string, unknown> | undefined;
  const fwr = s?.StatusFWR as Record<string, unknown> | undefined;
  const net = s?.StatusNET as Record<string, unknown> | undefined;
  const mqt = s?.StatusMQT as Record<string, unknown> | undefined;
  const sts = s?.StatusSTS as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Zurück
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {(statusInfo?.DeviceName as string) || ip}
        </h1>
        <span className="font-mono text-gray-400 text-sm">{ip}</span>
        <a
          href={`http://${ip}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Tasmota-Webinterface öffnen"
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Webinterface
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Device Info */}
        <InfoCard title="📋 Geräteinformatonen">
          <InfoRow label="Name" value={statusInfo?.DeviceName as string} />
          <InfoRow label="Modul" value={statusInfo?.Module as string} />
          <InfoRow label="Topic" value={statusInfo?.Topic as string} />
          <InfoRow label="Friendly Names" value={(statusInfo?.FriendlyName as string[])?.join(', ')} />
        </InfoCard>

        {/* Firmware */}
        <InfoCard title="⚙️ Firmware">
          <InfoRow label="Version" value={fwr?.Version as string} />
          <InfoRow label="Build" value={fwr?.BuildDateTime as string} />
          <InfoRow label="Core" value={fwr?.Core as string} />
          <InfoRow label="SDK" value={fwr?.SDK as string} />
        </InfoCard>

        {/* Network */}
        <InfoCard title="🌐 Netzwerk">
          <InfoRow label="Hostname" value={net?.Hostname as string} />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">IP</span>
            <span className="font-medium text-gray-900 flex items-center gap-1.5">
              {(net?.IPAddress as string) || '-'}
              <a
                href={`http://${net?.IPAddress || ip}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Tasmota-Webinterface öffnen"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </span>
          </div>
          <InfoRow label="Gateway" value={net?.Gateway as string} />
          <InfoRow label="MAC" value={net?.Mac as string} />
        </InfoCard>

        {/* MQTT */}
        <InfoCard title="📡 MQTT">
          <InfoRow label="Host" value={mqt?.MqttHost as string} />
          <InfoRow label="Port" value={String(mqt?.MqttPort || '')} />
          <InfoRow label="User" value={mqt?.MqttUser as string} />
          <InfoRow label="Client" value={mqt?.MqttClient as string} />
          <InfoRow label="Verbindungen" value={String(mqt?.MqttCount || 0)} />
        </InfoCard>

        {/* Status */}
        <InfoCard title="📊 Status">
          <InfoRow label="Power" value={String((sts?.POWER as string) || (sts?.POWER1 as string) || '-')} />
          <InfoRow label="Uptime" value={sts?.Uptime as string} />
          <InfoRow label="SSID" value={(sts?.Wifi as Record<string, unknown>)?.SSId as string} />
          <InfoRow label="RSSI" value={`${(sts?.Wifi as Record<string, unknown>)?.RSSI || 0}%`} />
        </InfoCard>
      </div>

      {/* Command Console */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">🖥️ Konsole</h2>
        <form onSubmit={handleCommand} className="flex gap-2">
          <input
            type="text"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="Tasmota-Befehl eingeben (z.B. Status 0, Power Toggle)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors text-sm"
          >
            Senden
          </button>
        </form>
        {cmdResult && (
          <pre className="mt-3 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-auto max-h-60 font-mono">
            {cmdResult}
          </pre>
        )}
      </div>

      {/* Raw JSON */}
      <details className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <summary className="cursor-pointer text-sm font-semibold text-gray-600">
          📄 Rohdaten (JSON)
        </summary>
        <pre className="mt-3 p-3 bg-gray-50 rounded-lg text-xs overflow-auto max-h-96 font-mono">
          {JSON.stringify(status, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">{value || '-'}</span>
    </div>
  );
}
