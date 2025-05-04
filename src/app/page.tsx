import React from 'react';
import { TelemetryProvider } from '../lib/contexts/TelemetryContext';
import TelemetryDisplay from '../components/TelemetryDisplay';
import TelemetryCharts from '../components/TelemetryCharts';
import Trajectory3D from '../components/Trajectory3D';
import ControlPanel from '../components/ControlPanel';

export default function Home() {
  return (
    <TelemetryProvider>
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="bg-blue-700 text-white p-4 mb-4 rounded shadow">
          <h1 className="text-2xl font-bold">Rocket Ground Station</h1>
        </header>

        <div className="grid grid-cols-1 gap-4">
          <ControlPanel />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TelemetryDisplay />
            <TelemetryCharts />
          </div>

          <Trajectory3D />
        </div>
      </div>
    </TelemetryProvider>
  );
}