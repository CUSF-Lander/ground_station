"use client";

import React, { useRef, useEffect } from 'react';
import { useTelemetry } from '../lib/contexts/TelemetryContext';

/**
 * Component to display the rocket's trajectory in 3D.
 * This is a placeholder - the actual 3D visualization would be implemented
 * using Three.js or a similar library.
 */
const Trajectory3D: React.FC = () => {
  const { latestData, logData, isLiveMode } = useTelemetry();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // This effect would handle initialization of the 3D scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Clear the canvas
    context.fillStyle = '#f3f4f6';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw placeholder text
    context.font = '16px Arial';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.fillText(
      '3D Trajectory Visualization Placeholder',
      canvasRef.current.width / 2,
      canvasRef.current.height / 2 - 20
    );
    context.fillText(
      'Implement with Three.js to visualize rocket trajectory',
      canvasRef.current.width / 2,
      canvasRef.current.height / 2 + 20
    );

    // TODO: Implement 3D visualization using Three.js:
    // 1. Initialize a Three.js scene, camera, and renderer
    // 2. Create a rocket model or representation
    // 3. Update the rocket's position and orientation based on telemetry data
    // 4. Draw the trajectory path based on historical data
    // 5. Add controls for camera movement and zoom
    // 6. Add reference grid and axes for orientation
    
  }, []);

  // This effect would update the 3D scene when new data arrives
  useEffect(() => {
    if (!latestData) return;
    
    // TODO: Update the 3D visualization with the latest data:
    // 1. Update rocket position and orientation based on latest data
    // 2. Add a new point to the trajectory path
    // 3. If in replay mode, highlight the current position in the trajectory

  }, [latestData, isLiveMode]);

  return (
    <div className="p-4 border rounded shadow-sm bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">3D Trajectory</h2>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-[500px] border rounded bg-gray-50"
        />
        <div className="absolute top-2 right-2">
          <p className="text-sm text-gray-500 italic">
            Trajectory is reconstructed from angular and linear acceleration data
          </p>
        </div>
      </div>
    </div>
  );
};

export default Trajectory3D;