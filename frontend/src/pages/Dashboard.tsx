import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ScanButton from '../components/ScanButton';
import DeviceTable from '../components/DeviceTable';

export default function Dashboard() {
  const { devices, scanning, scanError, startScan } = useAppContext();
  const [selectedIps, setSelectedIps] = useState<string[]>([]);

  function handleToggleSelect(ip: string) {
    setSelectedIps((prev) => (prev.includes(ip) ? prev.filter((i) => i !== ip) : [...prev, ip]));
  }

  function handleSelectAll() {
    if (selectedIps.length === devices.length) {
      setSelectedIps([]);
    } else {
      setSelectedIps(devices.map((d) => d.ip));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Finde und verwalte Tasmota-Geräte in deinem Netzwerk
          </p>
        </div>
      </div>

      <ScanButton scanning={scanning} deviceCount={devices.length} onScan={startScan} />

      {scanError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          ❌ Scan fehlgeschlagen: {scanError}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DeviceTable
          devices={devices}
          selectedIps={selectedIps}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
      </div>

      {selectedIps.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <span className="text-sm font-medium">{selectedIps.length} Gerät(e) ausgewählt</span>
          <a
            href="/mqtt"
            className="px-3 py-1 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            MQTT konfigurieren →
          </a>
        </div>
      )}
    </div>
  );
}
