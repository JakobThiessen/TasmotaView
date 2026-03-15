interface Props {
  scanning: boolean;
  deviceCount: number;
  onScan: () => void;
}

export default function ScanButton({ scanning, deviceCount, onScan }: Props) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onScan}
        disabled={scanning}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {scanning ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Scanne Netzwerk...
          </span>
        ) : (
          '🔍 Netzwerk scannen'
        )}
      </button>

      {!scanning && deviceCount > 0 && (
        <span className="text-sm text-gray-600">
          <span className="font-semibold text-blue-600">{deviceCount}</span> Tasmota-Gerät(e) gefunden
        </span>
      )}

      {scanning && (
        <div className="flex-1 max-w-md">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Scanne IP-Bereich... Dies kann 15-30 Sekunden dauern.</p>
        </div>
      )}
    </div>
  );
}
