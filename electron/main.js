import { app, BrowserWindow, shell, session } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

// ─── Settings path in user data (writable, survives updates) ───
function ensureUserSettings() {
  const userDataPath = app.getPath('userData');
  const dataDir = join(userDataPath, 'data');
  const settingsFile = join(dataDir, 'settings.json');

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  // Copy default settings on first launch
  if (!existsSync(settingsFile)) {
    const defaultSettings = isDev
      ? join(__dirname, '..', 'backend', 'data', 'settings.json')
      : join(process.resourcesPath, 'backend-data', 'settings.json');

    if (existsSync(defaultSettings)) {
      copyFileSync(defaultSettings, settingsFile);
    }
  }

  return dataDir;
}

// ─── Start Express Backend ─────────────────────────────────────
async function startBackend() {
  const dataDir = ensureUserSettings();

  // Set env so backend knows where to store settings
  process.env.TASMOTAVIEW_DATA_DIR = dataDir;

  // Set env for static files path (production)
  if (!isDev) {
    process.env.TASMOTAVIEW_STATIC_DIR = join(process.resourcesPath, 'frontend-dist');
  }

  // Import and start the backend server
  const serverPath = isDev
    ? join(__dirname, '..', 'backend', 'src', 'server.js')
    : join(process.resourcesPath, 'backend', 'src', 'server.js');

  const serverUrl = `file://${serverPath.replace(/\\/g, '/')}`;
  const server = await import(serverUrl);

  // Wait for server to be ready
  return new Promise((resolve) => {
    const check = () => {
      fetch('http://localhost:3001/api/settings')
        .then(() => resolve())
        .catch(() => setTimeout(check, 200));
    };
    // Give the server a moment to bind
    setTimeout(check, 500);
  });
}

// ─── Create App Window ─────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'TasmotaView',
    icon: join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    show: false,
  });

  // Load the app
  if (isDev) {
    // In dev mode, load from Vite dev server
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, load from Express server (serves static files)
    win.loadURL('http://localhost:3001');
  }

  // Show window when ready (avoids white flash)
  win.once('ready-to-show', () => {
    win.show();
  });

  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://192.168.') || url.startsWith('http://10.') || url.startsWith('http://172.')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  return win;
}

// ─── App Lifecycle ─────────────────────────────────────────────
app.whenReady().then(async () => {
  // Set Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:*; img-src 'self' data:;"
        ],
      },
    });
  });

  try {
    await startBackend();
    createWindow();
  } catch (err) {
    console.error('Failed to start TasmotaView:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
