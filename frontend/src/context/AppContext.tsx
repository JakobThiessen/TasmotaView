import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { TasmotaDevice, AppSettings } from '../types';
import { fetchScan, fetchSettings } from '../api';

interface AppContextType {
  devices: TasmotaDevice[];
  scanning: boolean;
  scanError: string | null;
  settings: AppSettings | null;
  startScan: () => Promise<void>;
  loadSettings: () => Promise<void>;
  setDevices: React.Dispatch<React.SetStateAction<TasmotaDevice[]>>;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings | null>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<TasmotaDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const startScan = useCallback(async () => {
    setScanning(true);
    setScanError(null);
    try {
      const found = await fetchScan();
      setDevices(found);
    } catch (err: unknown) {
      setScanError(err instanceof Error ? err.message : 'Scan fehlgeschlagen');
    } finally {
      setScanning(false);
    }
  }, []);

  const loadSettingsFn = useCallback(async () => {
    try {
      const s = await fetchSettings();
      setSettings(s);
    } catch {
      // ignore – use defaults
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        devices,
        scanning,
        scanError,
        settings,
        startScan,
        loadSettings: loadSettingsFn,
        setDevices,
        setSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
