"use client";

import React, { useRef, useEffect } from 'react';
import { useTelemetry } from '../lib/contexts/TelemetryContext';

// MUI components
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip
} from '@mui/material';
import RocketIcon from '@mui/icons-material/Rocket';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';

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
    context.fillStyle = '#121212'; // Dark background matching theme
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw grid lines
    context.strokeStyle = '#2a2a2a';
    context.lineWidth = 1;
    
    // Draw horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = i * (canvasRef.current.height / 10);
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvasRef.current.width, y);
      context.stroke();
    }
    
    // Draw vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = i * (canvasRef.current.width / 10);
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvasRef.current.height);
      context.stroke();
    }

    // Draw axes
    context.strokeStyle = '#555555';
    context.lineWidth = 2;

    // X-axis (horizontal)
    context.beginPath();
    context.moveTo(0, canvasRef.current.height / 2);
    context.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
    context.stroke();

    // Y-axis (vertical)
    context.beginPath();
    context.moveTo(canvasRef.current.width / 2, 0);
    context.lineTo(canvasRef.current.width / 2, canvasRef.current.height);
    context.stroke();

    // Draw placeholder text
    context.font = '16px Roboto';
    context.fillStyle = '#90caf9'; // Primary color
    context.textAlign = 'center';
    context.fillText(
      '3D Trajectory Visualization',
      canvasRef.current.width / 2,
      canvasRef.current.height / 2 - 30
    );
    context.fillStyle = '#f48fb1'; // Secondary color
    context.fillText(
      'Implement with Three.js',
      canvasRef.current.width / 2,
      canvasRef.current.height / 2 + 10
    );
    
    // Draw a simple rocket icon
    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;
    
    context.fillStyle = '#90caf9';
    context.beginPath();
    context.moveTo(centerX, centerY - 40);
    context.lineTo(centerX - 15, centerY);
    context.lineTo(centerX + 15, centerY);
    context.closePath();
    context.fill();
    
    context.fillStyle = '#f48fb1';
    context.beginPath();
    context.rect(centerX - 10, centerY, 20, 30);
    context.fill();
    
    context.fillStyle = '#ff7300';
    context.beginPath();
    context.moveTo(centerX - 10, centerY + 30);
    context.lineTo(centerX - 15, centerY + 40);
    context.lineTo(centerX - 5, centerY + 30);
    context.closePath();
    context.fill();
    
    context.beginPath();
    context.moveTo(centerX + 10, centerY + 30);
    context.lineTo(centerX + 15, centerY + 40);
    context.lineTo(centerX + 5, centerY + 30);
    context.closePath();
    context.fill();

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
    <Box>
      <Paper 
        variant="outlined" 
        sx={{ 
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          borderRadius: 1,
          bgcolor: 'background.paper'
        }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-[500px]"
        />
        
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0,
            p: 1,
            bgcolor: 'rgba(0,0,0,0.6)',
            borderRadius: 1
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Trajectory from IMU data
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Trajectory3D;