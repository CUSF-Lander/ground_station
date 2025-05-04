"use client";

import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../lib/contexts/TelemetryContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTime } from '../lib/utils/dateUtils';
import { CombinedTelemetryData } from '../lib/interfaces/telemetry';

// Maximum number of data points to keep in the chart
const MAX_DATA_POINTS = 100;

interface ChartDataPoint {
  timestamp: number;
  time: string;
  eulerX?: number;
  eulerY?: number;
  eulerZ?: number;
  velocityX?: number;
  velocityY?: number;
  velocityZ?: number;
  velocityMag?: number;
  linearAccelX?: number;
  linearAccelY?: number;
  linearAccelZ?: number;
  linearAccelMag?: number;
  angularAccelX?: number;
  angularAccelY?: number;
  angularAccelZ?: number;
  servoAngle?: number;
}

const TelemetryCharts: React.FC = () => {
  const { latestData, isLiveMode, logData, currentLogIndex } = useTelemetry();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedChart, setSelectedChart] = useState<string>('euler');

  // Update chart data when new telemetry arrives
  useEffect(() => {
    if (latestData) {
      if (isLiveMode) {
        // In live mode, append to existing data and limit size
        appendDataPoint(latestData);
      } else {
        // In playback mode, rebuild chart data from log
        if (logData.length > 0) {
          const visibleData = getVisibleDataForPlayback();
          setChartData(visibleData);
        }
      }
    }
  }, [latestData, isLiveMode, logData, currentLogIndex]);

  // Get visible data window for playback mode
  const getVisibleDataForPlayback = () => {
    // We want to show data centered around the current index
    const windowSize = MAX_DATA_POINTS;
    const halfWindow = Math.floor(windowSize / 2);
    
    let startIdx = Math.max(0, currentLogIndex - halfWindow);
    let endIdx = Math.min(logData.length - 1, currentLogIndex + halfWindow);
    
    // If we can't fill the window from one end, get more from the other
    if (endIdx - startIdx + 1 < windowSize) {
      if (startIdx === 0) {
        endIdx = Math.min(logData.length - 1, startIdx + windowSize - 1);
      } else if (endIdx === logData.length - 1) {
        startIdx = Math.max(0, endIdx - windowSize + 1);
      }
    }
    
    return logData.slice(startIdx, endIdx + 1).map(convertToChartPoint);
  };

  // Convert telemetry data to chart data point
  const convertToChartPoint = (data: CombinedTelemetryData): ChartDataPoint => {
    const point: ChartDataPoint = {
      timestamp: data.timestamp,
      time: formatTime(data.timestamp),
    };
    
    if (data.lora) {
      const { eulerAngles, velocity, linearAcceleration, angularAcceleration, servoMotorAngle } = data.lora;
      
      point.eulerX = eulerAngles.x;
      point.eulerY = eulerAngles.y;
      point.eulerZ = eulerAngles.z;
      
      point.velocityX = velocity.x;
      point.velocityY = velocity.y;
      point.velocityZ = velocity.z;
      point.velocityMag = Math.sqrt(
        Math.pow(velocity.x, 2) + 
        Math.pow(velocity.y, 2) + 
        Math.pow(velocity.z, 2)
      );
      
      point.linearAccelX = linearAcceleration.x;
      point.linearAccelY = linearAcceleration.y;
      point.linearAccelZ = linearAcceleration.z;
      point.linearAccelMag = Math.sqrt(
        Math.pow(linearAcceleration.x, 2) + 
        Math.pow(linearAcceleration.y, 2) + 
        Math.pow(linearAcceleration.z, 2)
      );
      
      point.angularAccelX = angularAcceleration.x;
      point.angularAccelY = angularAcceleration.y;
      point.angularAccelZ = angularAcceleration.z;
      
      point.servoAngle = servoMotorAngle;
    }
    
    return point;
  };

  // Append a new data point to the chart (for live mode)
  const appendDataPoint = (data: CombinedTelemetryData) => {
    setChartData(prevData => {
      const newPoint = convertToChartPoint(data);
      const newData = [...prevData, newPoint];
      
      // Keep only the most recent MAX_DATA_POINTS
      if (newData.length > MAX_DATA_POINTS) {
        return newData.slice(newData.length - MAX_DATA_POINTS);
      }
      
      return newData;
    });
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 border rounded">
          <p className="text-gray-500">No data available for charts</p>
        </div>
      );
    }

    switch (selectedChart) {
      case 'euler':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="eulerX" name="Roll (X)" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="eulerY" name="Pitch (Y)" stroke="#82ca9d" dot={false} />
              <Line type="monotone" dataKey="eulerZ" name="Yaw (Z)" stroke="#ff7300" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'velocity':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="velocityX" name="X Velocity" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="velocityY" name="Y Velocity" stroke="#82ca9d" dot={false} />
              <Line type="monotone" dataKey="velocityZ" name="Z Velocity" stroke="#ff7300" dot={false} />
              <Line type="monotone" dataKey="velocityMag" name="Magnitude" stroke="#ff0000" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'linearAccel':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="linearAccelX" name="X Accel" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="linearAccelY" name="Y Accel" stroke="#82ca9d" dot={false} />
              <Line type="monotone" dataKey="linearAccelZ" name="Z Accel" stroke="#ff7300" dot={false} />
              <Line type="monotone" dataKey="linearAccelMag" name="Magnitude" stroke="#ff0000" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'angularAccel':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="angularAccelX" name="X Angular Accel" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="angularAccelY" name="Y Angular Accel" stroke="#82ca9d" dot={false} />
              <Line type="monotone" dataKey="angularAccelZ" name="Z Angular Accel" stroke="#ff7300" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'servo':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="servoAngle" name="Servo Angle" stroke="#8884d8" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Telemetry Charts</h2>
        <div className="flex items-center space-x-2">
          <select
            className="border rounded px-2 py-1"
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
          >
            <option value="euler">Euler Angles</option>
            <option value="velocity">Velocity</option>
            <option value="linearAccel">Linear Acceleration</option>
            <option value="angularAccel">Angular Acceleration</option>
            <option value="servo">Servo Angle</option>
          </select>
        </div>
      </div>
      
      {renderChart()}
    </div>
  );
};

export default TelemetryCharts;