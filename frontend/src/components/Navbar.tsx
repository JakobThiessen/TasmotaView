import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <nav className="bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <Link to="/" className="text-white text-xl font-bold tracking-tight">
              TasmotaView
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className={linkClass('/')}>
              Dashboard
            </Link>
            <Link to="/mqtt" className={linkClass('/mqtt')}>
              MQTT Konfiguration
            </Link>
            <Link to="/settings" className={linkClass('/settings')}>
              Einstellungen
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
