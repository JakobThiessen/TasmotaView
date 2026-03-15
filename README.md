# TasmotaView

> Web-basierter Tasmota Device Manager – findet alle Tasmota-Geräte im lokalen Netzwerk und ermöglicht die zentrale MQTT-Konfiguration.

![Architektur](https://img.shields.io/badge/Frontend-React_+_Vite-blue) ![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-green) ![CSS](https://img.shields.io/badge/CSS-Tailwind_CSS-purple)

---

## Inhaltsverzeichnis

- [Überblick](#überblick)
- [Features](#features)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [Starten](#starten)
- [Projektstruktur](#projektstruktur)
- [Architektur](#architektur)
- [Seiten & Funktionen](#seiten--funktionen)
- [API-Endpunkte (Backend)](#api-endpunkte-backend)
- [Konfiguration](#konfiguration)
- [Wie funktioniert der Netzwerk-Scan?](#wie-funktioniert-der-netzwerk-scan)
- [MQTT auf Geräten konfigurieren](#mqtt-auf-geräten-konfigurieren)
- [Troubleshooting](#troubleshooting)
- [Technologie-Stack](#technologie-stack)
- [Lizenz](#lizenz)

---

## Überblick

TasmotaView ist eine moderne Web-App (React + Node.js), die – angelehnt an das Java-Tool [TasmoView von Andreas Kielkopf](https://github.com/andreaskielkopf/TasmoView) – alle Tasmota-Geräte im lokalen Netzwerk per HTTP-Scan findet und deren Status tabellarisch darstellt. Zusätzlich können MQTT-Broker-Einstellungen (z.B. Mosquitto) zentral auf alle oder ausgewählte Geräte übertragen werden.

Im Gegensatz zum Original (Java-Desktop-App) läuft TasmotaView komplett im Browser und benötigt lediglich Node.js.

## Features

- **Netzwerk-Scan**: Scannt den konfigurierbaren IP-Bereich (Standard: `192.168.178.1–254`) nach Tasmota-Geräten
- **Geräte-Tabelle**: Zeigt Gerätename, IP, Hostname, Firmware, WLAN (SSID + RSSI), MQTT-Status, Power-State und Uptime
- **MQTT-Konfiguration**: Setzt MQTT-Host, Port, User und Passwort auf ausgewählte Geräte per `Backlog`-Befehl
- **Geräte-Detailansicht**: Firmware-Info, Netzwerk, MQTT, Status – plus eine **Konsole** zum Senden beliebiger Tasmota-Befehle
- **Persistente Einstellungen**: Scan-Bereich, Authentifizierung und MQTT-Defaults werden serverseitig gespeichert
- **Unterstützung für passwortgeschützte Geräte**: User/Password-Authentifizierung für Tasmota-Webinterfaces

---

## Voraussetzungen

| Software | Version | Hinweis |
|----------|---------|--------|
| **Node.js** | ≥ 18.x | Wird für Backend und Build benötigt ([Download](https://nodejs.org/)) |
| **npm** | ≥ 9.x | Kommt mit Node.js |
| **Browser** | Chrome, Firefox, Edge (aktuell) | Für das Frontend |

> **Kein Java benötigt** – Im Gegensatz zum Original-TasmotaView ist alles JavaScript/TypeScript.

### Optional

- **Mosquitto** (oder ein anderer MQTT-Broker) im Netzwerk, falls du MQTT konfigurieren möchtest
- Tasmota-Geräte im selben Netzwerk-Subnetz

---

## Installation

### 1. Repository klonen / Projektordner öffnen

```bash
cd d:\Proj\TasmoView
```

### 2. Abhängigkeiten installieren

Es gibt drei `package.json`-Dateien (Root, Backend, Frontend). Alle drei müssen installiert werden:

```bash
# Root-Abhängigkeiten (concurrently)
npm install

# Backend-Abhängigkeiten (express, cors)
cd backend
npm install
cd ..

# Frontend-Abhängigkeiten (react, vite, tailwind, etc.)
cd frontend
npm install
cd ..
```

**Kurzform (alles in einem Befehl):**

```bash
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
```

---

## Starten

### Entwicklungsmodus (empfohlen)

Startet Backend und Frontend gleichzeitig mit Hot-Reload:

```bash
npm run dev
```

Das startet:
- **Backend** (Express) auf `http://localhost:3001`
- **Frontend** (Vite Dev Server) auf `http://localhost:5173`

> Öffne **http://localhost:5173** im Browser.

Der Vite Dev Server proxied automatisch alle `/api/*`-Anfragen an das Backend auf Port 3001.

### Nur Backend starten

```bash
cd backend
npm run dev
```

### Nur Frontend starten

```bash
cd frontend
npm run dev
```

### Produktions-Build

```bash
# Frontend bauen (Output in frontend/dist/)
npm run build

# Backend im Produktionsmodus starten
npm start
```

Für Produktion müsste das Frontend-Build (`frontend/dist/`) vom Express-Server als statische Dateien ausgeliefert werden (oder per Nginx/Apache).

---

## Projektstruktur

```
TasmotaView/
├── package.json                 # Root – startet Backend + Frontend parallel
│
├── backend/
│   ├── package.json             # Backend-Abhängigkeiten
│   ├── data/
│   │   └── settings.json        # Persistente Einstellungen (Scan, Auth, MQTT)
│   └── src/
│       ├── server.js            # Express HTTP-Server & API-Routen
│       ├── scanner.js           # Netzwerk-Scan-Logik (IP-Bereich durchlaufen)
│       ├── tasmota.js           # Tasmota HTTP-Befehle (Proxy, MQTT-Config)
│       └── settings.js          # Einstellungen lesen/schreiben
│
└── frontend/
    ├── package.json             # Frontend-Abhängigkeiten
    ├── index.html               # HTML-Einstiegspunkt
    ├── vite.config.ts           # Vite-Konfiguration (inkl. API-Proxy)
    ├── tailwind.config.js       # Tailwind CSS Konfiguration
    ├── tsconfig.json            # TypeScript-Konfiguration
    └── src/
        ├── main.tsx             # React-Einstiegspunkt
        ├── App.tsx              # Router & Layout
        ├── api.ts               # API-Client (Frontend → Backend)
        ├── index.css            # Tailwind-Imports
        ├── vite-env.d.ts        # Vite TypeScript-Deklarationen
        ├── types/
        │   └── index.ts         # TypeScript-Interfaces
        ├── context/
        │   └── AppContext.tsx    # React Context (globaler State)
        ├── components/
        │   ├── Navbar.tsx       # Navigationsleiste
        │   ├── ScanButton.tsx   # Scan-Startbutton mit Ladeindikator
        │   ├── DeviceTable.tsx  # Geräte-Tabelle mit Checkbox-Auswahl
        │   └── MqttConfigForm.tsx # MQTT-Konfigurationsformular
        └── pages/
            ├── Dashboard.tsx    # Hauptseite – Scan + Geräteliste
            ├── MqttPage.tsx     # MQTT-Broker auf Geräte übertragen
            ├── SettingsPage.tsx # Einstellungen bearbeiten
            └── DeviceDetail.tsx # Einzelgerät-Detailansicht + Konsole
```

---

## Architektur

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   Browser (React SPA)   │  /api/* │   Node.js Express       │
│                         │────────▶│   Backend (Port 3001)   │
│   http://localhost:5173 │         │                         │
└─────────────────────────┘         └────────┬────────────────┘
                                             │
                                             │ HTTP GET/POST
                                             │ http://<ip>/cm?cmnd=...
                                             ▼
                                    ┌─────────────────────┐
                                    │  Tasmota-Geräte     │
                                    │  192.168.178.x      │
                                    │  (ESP8266/ESP32)     │
                                    └─────────────────────┘
```

**Warum ein Backend?**
Browser können nicht direkt auf Tasmota-Geräte zugreifen (CORS-Blockierung). Das Backend agiert als Proxy und sendet die HTTP-Befehle an die Geräte weiter.

---

## Seiten & Funktionen

### 1. Dashboard (`/`)

- **Netzwerk scannen**: Button startet den Scan über das Backend
- **Geräte-Tabelle**: Gerätename, IP-Adresse, Hostname, Firmware-Version, WLAN (SSID + RSSI-Balken), MQTT-Status (Badge), Power-State, Uptime
- **Checkbox-Auswahl**: Geräte für Batch-Aktionen (z.B. MQTT-Konfiguration) auswählen
- **Klick auf Gerätename**: Öffnet die Detailansicht

### 2. MQTT Konfiguration (`/mqtt`)

- **Formular**: MQTT-Host, Port, User, Passwort eingeben
- **Geräteauswahl**: Alle oder einzelne Geräte per Checkbox wählen
- **"Anwenden"**: Sendet `Backlog MqttHost <host>; MqttPort <port>; MqttUser <user>; MqttPassword <pass>` an jedes ausgewählte Gerät
- **Ergebnis**: Zeigt pro Gerät ob die Konfiguration erfolgreich war

### 3. Einstellungen (`/settings`)

- **Netzwerk-Scan**: Subnetz, IP-Bereich (Start/Ende), Timeout, Batch-Größe
- **Tasmota-Auth**: User und Passwort für passwortgeschützte Geräte
- **MQTT-Defaults**: Standard-MQTT-Werte, die im MQTT-Formular vorausgefüllt werden
- Einstellungen werden in `backend/data/settings.json` persistiert

### 4. Geräte-Detail (`/device/:ip`)

- **Infokarten**: Geräteinformationen, Firmware, Netzwerk, MQTT, Status
- **Konsole**: Beliebige Tasmota-Befehle senden (z.B. `Status 0`, `Power Toggle`, `SetOption19 1`)
- **Rohdaten**: Vollständige JSON-Antwort des Geräts einsehbar

---

## API-Endpunkte (Backend)

| Methode | Endpunkt | Beschreibung |
|---------|----------|-------------|
| `GET` | `/api/scan` | Scannt den konfigurierten IP-Bereich nach Tasmota-Geräten |
| `GET` | `/api/device/:ip/status` | Holt `Status 0` von einem einzelnen Gerät |
| `POST` | `/api/device/:ip/command` | Sendet einen beliebigen Befehl. Body: `{ "cmnd": "Power Toggle" }` |
| `POST` | `/api/mqtt/configure` | Konfiguriert MQTT auf mehreren Geräten. Body: `{ "devices": ["192.168.178.100"], "mqtt": { "host": "...", "port": 1883, "user": "...", "password": "..." } }` |
| `GET` | `/api/settings` | Liest aktuelle Einstellungen |
| `PUT` | `/api/settings` | Speichert Einstellungen |

### Beispiele mit curl

```bash
# Netzwerk scannen
curl http://localhost:3001/api/scan

# Status eines Geräts abrufen
curl http://localhost:3001/api/device/192.168.178.100/status

# Befehl an Gerät senden
curl -X POST http://localhost:3001/api/device/192.168.178.100/command \
  -H "Content-Type: application/json" \
  -d '{"cmnd": "Power Toggle"}'

# MQTT auf Geräten konfigurieren
curl -X POST http://localhost:3001/api/mqtt/configure \
  -H "Content-Type: application/json" \
  -d '{"devices": ["192.168.178.100", "192.168.178.101"], "mqtt": {"host": "192.168.178.50", "port": 1883, "user": "mqtt_user", "password": "mqtt_pass"}}'

# Einstellungen abrufen
curl http://localhost:3001/api/settings
```

---

## Konfiguration

Die Einstellungen werden in `backend/data/settings.json` gespeichert:

```json
{
  "scan": {
    "subnet": "192.168.178",
    "rangeStart": 1,
    "rangeEnd": 254,
    "timeout": 1500,
    "batchSize": 30
  },
  "auth": {
    "user": "admin",
    "password": ""
  },
  "mqtt": {
    "host": "",
    "port": 1883,
    "user": "",
    "password": ""
  }
}
```

| Parameter | Beschreibung | Standard |
|-----------|-------------|----------|
| `scan.subnet` | Subnetz-Präfix (ohne letzte Oktett) | `192.168.178` |
| `scan.rangeStart` | Erste IP im Scan | `1` |
| `scan.rangeEnd` | Letzte IP im Scan | `254` |
| `scan.timeout` | Timeout pro IP in Millisekunden | `1500` |
| `scan.batchSize` | Anzahl paralleler Requests | `30` |
| `auth.user` | Tasmota Web-Benutzername | `admin` |
| `auth.password` | Tasmota Web-Passwort | `` (leer) |
| `mqtt.host` | Standard MQTT-Broker-Adresse | `` (leer) |
| `mqtt.port` | Standard MQTT-Port | `1883` |
| `mqtt.user` | Standard MQTT-Benutzername | `` (leer) |
| `mqtt.password` | Standard MQTT-Passwort | `` (leer) |

Die Einstellungen können über die Web-Oberfläche (`/settings`) oder direkt in der Datei geändert werden.

---

## Wie funktioniert der Netzwerk-Scan?

1. Das Backend generiert alle IPs im Bereich (z.B. `192.168.178.1` bis `192.168.178.254`)
2. In Batches à 30 (konfigurierbar) werden parallele HTTP-Requests gesendet:
   ```
   GET http://<ip>/cm?cmnd=Status%200
   ```
3. Jeder Request hat ein Timeout von 1.5 Sekunden
4. **Tasmota-Geräte** antworten mit einem JSON-Objekt das `StatusFWR`, `StatusNET`, `StatusSTS`, `StatusMQT` etc. enthält
5. **Nicht-Tasmota-Geräte** (Router, Drucker, PCs) antworten entweder nicht, mit einem Timeout, oder mit ungültigem JSON → werden ignoriert
6. Gefundene Geräte werden mit allen relevanten Daten (Name, Firmware, WLAN, MQTT, Power, Uptime, Hostname) an das Frontend zurückgegeben

**Dauer**: Ca. 15–30 Sekunden für den gesamten /24-Bereich (254 IPs).

---

## MQTT auf Geräten konfigurieren

### Schritt für Schritt

1. **Dashboard öffnen** → `http://localhost:5173`
2. **"Netzwerk scannen"** klicken – gefundene Geräte erscheinen in der Tabelle
3. **Geräte auswählen** mit den Checkboxen (oder "Alle auswählen")
4. **Zu "MQTT Konfiguration" navigieren** (Navbar oder Floating-Button)
5. **MQTT-Daten eingeben**:
   - Host: IP deines Mosquitto-Brokers (z.B. `192.168.178.50`)
   - Port: `1883` (Standard)
   - User/Passwort: falls dein Broker Authentifizierung erfordert
6. **"Auf X Gerät(e) anwenden"** klicken
7. Das Backend sendet an jedes Gerät:
   ```
   Backlog MqttHost 192.168.178.50; MqttPort 1883; MqttUser user; MqttPassword pass
   ```
8. **Ergebnis**: Pro Gerät wird angezeigt ob die Konfiguration erfolgreich war

> **Hinweis**: Nach der MQTT-Konfiguration startet das Tasmota-Gerät automatisch einen Neuonnect zum neuen Broker. Ein Geräte-Neustart ist nicht erforderlich.

### Tasmota-Befehle die verwendet werden

| Befehl | Beschreibung |
|--------|-------------|
| `MqttHost <ip>` | MQTT-Broker IP/Hostname setzen |
| `MqttPort <port>` | MQTT-Broker Port setzen |
| `MqttUser <user>` | MQTT-Benutzername setzen |
| `MqttPassword <pass>` | MQTT-Passwort setzen |
| `Backlog` | Mehrere Befehle in einer Anfrage kombinieren |

---

## Troubleshooting

### Keine Geräte gefunden

- **Subnet prüfen**: Ist `192.168.178` das richtige Subnetz? Prüfe mit `ipconfig` (Windows) oder `ip addr` (Linux) dein Netzwerk.
- **Timeout erhöhen**: In den Einstellungen von 1500ms auf 3000ms erhöhen – langsame Geräte brauchen länger.
- **Firewall**: Stelle sicher, dass der PC auf Port 80 andere Geräte im LAN erreichen kann.
- **Passwort**: Falls Tasmota-Geräte passwortgeschützt sind, trage User/Passwort in den Einstellungen ein.

### Backend startet nicht

```bash
# Prüfe ob Port 3001 frei ist
netstat -ano | findstr :3001

# Node.js Version prüfen (≥ 18 benötigt)
node --version
```

### Frontend zeigt "Fetch failed"

- Ist das Backend gestartet? (`http://localhost:3001/api/settings` im Browser testen)
- Läuft das Frontend mit Vite? (Proxy ist nur im Dev-Modus aktiv)

### MQTT-Konfiguration schlägt fehl

- Gerät erreichbar? Geräte-IP im Browser öffnen: `http://192.168.178.x`
- Falsches Passwort? Prüfe die Auth-Einstellungen
- Gerät reagiert nicht? Timeout in den Einstellungen erhöhen

---

## Technologie-Stack

| Komponente | Technologie | Version |
|-----------|-------------|---------|
| **Frontend** | React | 19.x |
| **Build-Tool** | Vite | 6.x |
| **Sprache (Frontend)** | TypeScript | 5.x |
| **CSS** | Tailwind CSS | 3.x |
| **Routing** | React Router | 7.x |
| **Backend** | Node.js + Express | 18+ / 4.x |
| **HTTP-Kommunikation** | Native `fetch()` (Node 18+) | — |

---

## Lizenz

Dieses Projekt ist inspiriert von [TasmoView](https://github.com/andreaskielkopf/TasmoView) von Andreas Kielkopf (GPL-3.0).

### Abhängigkeiten & Lizenzen

| Paket | Lizenz | Verwendung |
|-------|--------|-----------|
| [React](https://github.com/facebook/react) | MIT | UI-Framework (Frontend) |
| [React DOM](https://github.com/facebook/react) | MIT | React Rendering (Frontend) |
| [React Router](https://github.com/remix-run/react-router) | MIT | Client-Side Routing (Frontend) |
| [Vite](https://github.com/vitejs/vite) | MIT | Build-Tool & Dev-Server (Frontend) |
| [TypeScript](https://github.com/microsoft/TypeScript) | Apache-2.0 | Typisierung (Frontend) |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | MIT | Utility-First CSS-Framework (Frontend) |
| [PostCSS](https://github.com/postcss/postcss) | MIT | CSS-Verarbeitung (Frontend) |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | MIT | CSS Vendor-Prefixes (Frontend) |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | MIT | Vite React-Integration (Frontend) |
| [Express](https://github.com/expressjs/express) | MIT | HTTP-Server (Backend) |
| [cors](https://github.com/expressjs/cors) | MIT | CORS-Middleware (Backend) |
| [concurrently](https://github.com/open-cli-tools/concurrently) | MIT | Paralleles Starten von Prozessen (Root) |
