import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MqttPage from './pages/MqttPage';
import SettingsPage from './pages/SettingsPage';
import DeviceDetail from './pages/DeviceDetail';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mqtt" element={<MqttPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/device/:ip" element={<DeviceDetail />} />
        </Routes>
      </main>
    </div>
  );
}
