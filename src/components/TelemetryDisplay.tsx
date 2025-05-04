"use client";

import React from 'react';
import { useTelemetry } from '../lib/contexts/TelemetryContext';
import { formatDate } from '@/lib/utils/dateUtils';

const TelemetryDisplay: React.FC = () => {
  const { latestData, isLiveMode } = useTelemetry();

  if (!latestData) {
    return (
      <div className="p-4 border rounded shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Telemetry Data</h2>
        <p>No data available. {isLiveMode ? 'Waiting for data...' : 'Please load a log file.'}</p>
      </div>
    );
  }

  const { lora, rtk, timestamp } = latestData;

  // Helper function to safely format numbers with a default value if null/undefined
  const safeFormat = (value: number | undefined | null, decimals: number = 2, defaultValue: string = "N/A"): string => {
    return value !== undefined && value !== null ? value.toFixed(decimals) : defaultValue;
  };

  // Calculate velocity magnitude safely
  const calculateMagnitude = (vector: { x?: number, y?: number, z?: number } | undefined | null): string => {
    if (!vector || vector.x === undefined || vector.y === undefined || vector.z === undefined) {
      return "N/A";
    }
    
    return Math.sqrt(
      Math.pow(vector.x, 2) + 
      Math.pow(vector.y, 2) + 
      Math.pow(vector.z, 2)
    ).toFixed(2);
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Telemetry Data</h2>
      <p className="text-sm text-gray-500 mb-4">
        Timestamp: {formatDate(timestamp)}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LoRa Data Section */}
        <div className="border rounded p-3">
          <h3 className="font-medium text-blue-600 mb-2">Rocket Data (LoRa)</h3>
          {!lora ? (
            <p>No LoRa data available</p>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Euler Counter: {lora.eulerCounter ?? "N/A"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Euler Angles (degrees):</p>
                <ul className="list-disc list-inside text-sm ml-2">
                  <li>X (Roll): {safeFormat(lora.eulerAngles?.x)}°</li>
                  <li>Y (Pitch): {safeFormat(lora.eulerAngles?.y)}°</li>
                  <li>Z (Yaw): {safeFormat(lora.eulerAngles?.z)}°</li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-medium">Velocity (m/s):</p>
                <ul className="list-disc list-inside text-sm ml-2">
                  <li>X: {safeFormat(lora.velocity?.x)}</li>
                  <li>Y: {safeFormat(lora.velocity?.y)}</li>
                  <li>Z: {safeFormat(lora.velocity?.z)}</li>
                  <li>Magnitude: {calculateMagnitude(lora.velocity)}</li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-medium">Gravity (m/s²):</p>
                <ul className="list-disc list-inside text-sm ml-2">
                  <li>X: {safeFormat(lora.gravity?.x)}</li>
                  <li>Y: {safeFormat(lora.gravity?.y)}</li>
                  <li>Z: {safeFormat(lora.gravity?.z)}</li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-medium">Angular Acceleration (rad/s²):</p>
                <ul className="list-disc list-inside text-sm ml-2">
                  <li>X: {safeFormat(lora.angularAcceleration?.x)}</li>
                  <li>Y: {safeFormat(lora.angularAcceleration?.y)}</li>
                  <li>Z: {safeFormat(lora.angularAcceleration?.z)}</li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-medium">Linear Acceleration (m/s²):</p>
                <ul className="list-disc list-inside text-sm ml-2">
                  <li>X: {safeFormat(lora.linearAcceleration?.x)}</li>
                  <li>Y: {safeFormat(lora.linearAcceleration?.y)}</li>
                  <li>Z: {safeFormat(lora.linearAcceleration?.z)}</li>
                  <li>Magnitude: {calculateMagnitude(lora.linearAcceleration)}</li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-medium">Free Heap Size: {lora.freeHeapSize ?? "N/A"} bytes</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Servo Motor Angle: {safeFormat(lora.servoMotorAngle, 1)}°</p>
              </div>
            </div>
          )}
        </div>

        {/* RTK Data Section */}
        <div className="border rounded p-3">
          <h3 className="font-medium text-green-600 mb-2">External Position (RTK GPS)</h3>
          {!rtk ? (
            <p>No RTK data available</p>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Position:</p>
                <ul className="list-disc list-inside text-sm ml-2">
                  <li>X: {safeFormat(rtk.position?.x)} m</li>
                  <li>Y: {safeFormat(rtk.position?.y)} m</li>
                  <li>Z (Altitude): {safeFormat(rtk.position?.z)} m</li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-medium">Orientation (degrees):</p>
                <ul className="list-disc list-inside text-sm ml-2">
                  <li>X (Roll): {safeFormat(rtk.orientation?.x)}°</li>
                  <li>Y (Pitch): {safeFormat(rtk.orientation?.y)}°</li>
                  <li>Z (Yaw): {safeFormat(rtk.orientation?.z)}°</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelemetryDisplay;