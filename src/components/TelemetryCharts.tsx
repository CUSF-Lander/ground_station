"use client";

import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../lib/contexts/TelemetryContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTime } from '../lib/utils/dateUtils';
import { CombinedTelemetryData } from '../lib/interfaces/telemetry';

// MUI components
import {
  Box,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Paper,
  useTheme,
  Grid,
  IconButton
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SpeedIcon from '@mui/icons-material/Speed';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import LoopIcon from '@mui/icons-material/Loop';

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

interface ChartOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color1: string;
  color2: string;
  color3: string;
  color4?: string;
}

const TelemetryCharts: React.FC = () => {
  const { latestData, isLiveMode, logData, currentLogIndex } = useTelemetry();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  // Create four separate chart selection states
  const [selectedCharts, setSelectedCharts] = useState<string[]>(['euler', 'velocity', 'linearAccel', 'angularAccel']);
  const theme = useTheme();

  const chartOptions: ChartOption[] = [
    { 
      id: 'euler', 
      label: 'Euler Angles', 
      icon: <RotateRightIcon />,
      color1: '#8884d8', 
      color2: '#82ca9d', 
      color3: '#ff7300'
    },
    { 
      id: 'velocity', 
      label: 'Velocity', 
      icon: <SpeedIcon />,
      color1: '#8884d8', 
      color2: '#82ca9d', 
      color3: '#ff7300',
      color4: '#ff0000'
    },
    { 
      id: 'linearAccel', 
      label: 'Linear Accel', 
      icon: <LinearScaleIcon />,
      color1: '#8884d8', 
      color2: '#82ca9d', 
      color3: '#ff7300',
      color4: '#ff0000'
    },
    { 
      id: 'angularAccel', 
      label: 'Angular Accel', 
      icon: <LoopIcon />,
      color1: '#8884d8', 
      color2: '#82ca9d', 
      color3: '#ff7300'
    },
    { 
      id: 'servo', 
      label: 'Servo Angle', 
      icon: <SettingsInputAntennaIcon />,
      color1: '#8884d8', 
      color2: '#82ca9d', 
      color3: '#ff7300'
    }
  ];

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

  // Handler to update a specific chart's selection
  const handleChartTypeChange = (index: number, value: string) => {
    if (!value) return;
    
    setSelectedCharts(prev => {
      const newSelections = [...prev];
      newSelections[index] = value;
      return newSelections;
    });
  };

  const renderSingleChart = (chartType: string, height: number | string = 190) => {
    if (chartData.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: height,
          bgcolor: 'background.paper'
        }}>
          {isLiveMode ? (
            <>
              <CircularProgress size={30} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Waiting for data...
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          )}
        </Box>
      );
    }

    const chartOption = chartOptions.find(option => option.id === chartType);
    
    switch (chartType) {
      case 'euler':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="time" 
                stroke={theme.palette.text.secondary} 
                style={{ fontSize: '0.7rem' }}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: '0.7rem' }} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  fontSize: '0.7rem'
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '0.7rem', paddingLeft: '10px' }} 
              />
              <Line type="monotone" dataKey="eulerX" name="Roll (X)" stroke={chartOption?.color1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="eulerY" name="Pitch (Y)" stroke={chartOption?.color2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="eulerZ" name="Yaw (Z)" stroke={chartOption?.color3} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'velocity':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="time" 
                stroke={theme.palette.text.secondary} 
                style={{ fontSize: '0.7rem' }}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: '0.7rem' }} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  fontSize: '0.7rem'
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '0.7rem', paddingLeft: '10px' }} 
              />
              <Line type="monotone" dataKey="velocityX" name="X Velocity" stroke={chartOption?.color1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="velocityY" name="Y Velocity" stroke={chartOption?.color2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="velocityZ" name="Z Velocity" stroke={chartOption?.color3} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="velocityMag" name="Magnitude" stroke={chartOption?.color4} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'linearAccel':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="time" 
                stroke={theme.palette.text.secondary} 
                style={{ fontSize: '0.7rem' }}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: '0.7rem' }} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  fontSize: '0.7rem'
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '0.7rem', paddingLeft: '10px' }} 
              />
              <Line type="monotone" dataKey="linearAccelX" name="X Accel" stroke={chartOption?.color1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="linearAccelY" name="Y Accel" stroke={chartOption?.color2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="linearAccelZ" name="Z Accel" stroke={chartOption?.color3} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="linearAccelMag" name="Magnitude" stroke={chartOption?.color4} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'angularAccel':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="time" 
                stroke={theme.palette.text.secondary} 
                style={{ fontSize: '0.7rem' }}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: '0.7rem' }} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  fontSize: '0.7rem'
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '0.7rem', paddingLeft: '10px' }} 
              />
              <Line type="monotone" dataKey="angularAccelX" name="X Angular" stroke={chartOption?.color1} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="angularAccelY" name="Y Angular" stroke={chartOption?.color2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="angularAccelZ" name="Z Angular" stroke={chartOption?.color3} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'servo':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="time" 
                stroke={theme.palette.text.secondary} 
                style={{ fontSize: '0.7rem' }}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: '0.7rem' }} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  fontSize: '0.7rem'
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '0.7rem', paddingLeft: '10px' }} 
              />
              <Line type="monotone" dataKey="servoAngle" name="Servo Angle" stroke={chartOption?.color1} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const renderChartPanel = (index: number) => {
    const selectedChart = selectedCharts[index];
    const chartOption = chartOptions.find(option => option.id === selectedChart);
    
    return (
      <Paper variant="outlined" sx={{ mb: 0, flex: 1, minHeight: '10%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" display="flex" alignItems="center">
              {chartOption?.icon}
              <Box component="span" sx={{ ml: 1 }}>
                {chartOption?.label}
              </Box>
            </Typography>
            <ToggleButtonGroup
              value={selectedChart}
              exclusive
              size="small"
              onChange={(e, value) => handleChartTypeChange(index, value)}
            >
              {chartOptions.map((option) => (
                <ToggleButton key={option.id} value={option.id} sx={{ py: 0.5, px: 1 }}>
                  {option.icon}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Box>
        <Box sx={{ 
          px: 1, 
          pb: 1, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          height: '180px'
        }}>
          {renderSingleChart(selectedChart, '100%')}
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100% - 40px)',
        gap: 2 // Increased gap between charts for better separation
      }}>
        {renderChartPanel(0)}
        {renderChartPanel(1)}
        {renderChartPanel(2)}
      </Box>
    </Box>
  );
};

export default TelemetryCharts;