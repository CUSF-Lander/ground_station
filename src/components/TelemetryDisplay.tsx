"use client";

import React from 'react';
import { useTelemetry } from '../lib/contexts/TelemetryContext';
import { formatDate } from '@/lib/utils/dateUtils';

// MUI components
import {
  Box,
  Typography,
  Stack,
  Chip,
  Paper,
  Grid
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SensorsIcon from '@mui/icons-material/Sensors';
import SpeedIcon from '@mui/icons-material/Speed';
import ExploreIcon from '@mui/icons-material/Explore';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import HeightIcon from '@mui/icons-material/Height';

const TelemetryDisplay: React.FC = () => {
  const { latestData, isLiveMode } = useTelemetry();

  if (!latestData) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Telemetry Data
        </Typography>
        <Paper sx={{ p: 1, bgcolor: 'background.paper', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {isLiveMode ? 'Waiting for data...' : 'Please load a log file.'}
          </Typography>
        </Paper>
      </Box>
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
    <Box sx={{ p: 0 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <Typography variant="subtitle1">Telemetry</Typography>
        <Chip
          size="small"
          icon={<ScheduleIcon sx={{ fontSize: '0.8rem' }} />}
          label={formatDate(timestamp)}
          color="primary"
          variant="outlined"
          sx={{ height: 22 }}
        />
      </Stack>

      <Grid container spacing={1}>
        {/* Left Column - LoRa Data */}
        <Grid item xs={6}>
          {!lora ? (
            <Typography variant="caption" color="text.secondary">No data</Typography>
          ) : (
            <Stack spacing={0.5}>
              {/* Euler and System Info combined */}
              <Paper variant="outlined" sx={{ p: 0.5 }}>
                <Grid container spacing={0.5}>
                  <Grid item xs={4}>
                    <Chip size="small" label={`EC: ${lora.eulerCounter ?? "N/A"}`} sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip size="small" label={`Heap: ${lora.freeHeapSize ?? "N/A"}`} sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip size="small" label={`Srv: ${safeFormat(lora.servoMotorAngle, 1)}°`} sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Euler Angles */}
              <Paper variant="outlined" sx={{ p: 0.5 }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <RotateRightIcon sx={{ mr: 0.5, fontSize: 14 }} />
                  Euler (°)
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={4}>
                    <Chip size="small" label={`X: ${safeFormat(lora.eulerAngles?.x)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip size="small" label={`Y: ${safeFormat(lora.eulerAngles?.y)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip size="small" label={`Z: ${safeFormat(lora.eulerAngles?.z)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          )}
        </Grid>

        {/* Middle Column - LoRa Data Cont */}
        <Grid item xs={6}>
          {!lora ? (
            <Typography variant="caption" color="text.secondary">No data</Typography>
          ) : (
            <Stack spacing={0.5}>
              
              {/* Velocity */}
              <Paper variant="outlined" sx={{ p: 0.5 }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <SpeedIcon sx={{ mr: 0.5, fontSize: 14 }} />
                  Velocity (m/s)
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={3}>
                    <Chip size="small" label={`X: ${safeFormat(lora.velocity?.x)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={3}>
                    <Chip size="small" label={`Y: ${safeFormat(lora.velocity?.y)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={3}>
                    <Chip size="small" label={`Z: ${safeFormat(lora.velocity?.z)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={3}>
                    <Chip size="small" color="primary" label={`|v|: ${calculateMagnitude(lora.velocity)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Linear Acceleration */}
              <Paper variant="outlined" sx={{ p: 0.5 }}>
                <Typography variant="caption" sx={{ mb: 0.5 }}>
                  Linear Accel (m/s²)
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={3}>
                    <Chip size="small" label={`X: ${safeFormat(lora.linearAcceleration?.x)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={3}>
                    <Chip size="small" label={`Y: ${safeFormat(lora.linearAcceleration?.y)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={3}>
                    <Chip size="small" label={`Z: ${safeFormat(lora.linearAcceleration?.z)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={3}>
                    <Chip size="small" color="primary" label={`|a|: ${calculateMagnitude(lora.linearAcceleration)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          )}
        </Grid>

        {/* Right Column - RTK Data */}
        <Grid item xs={6}>
          {!rtk ? (
            <Typography variant="caption" color="text.secondary">No RTK data</Typography>
          ) : (
            <Stack spacing={0.5}>
              {/* Position */}
              <Paper variant="outlined" sx={{ p: 0.5 }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <ExploreIcon sx={{ mr: 0.5, fontSize: 14 }} />
                  Position (m)
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={4}>
                    <Chip size="small" label={`X: ${safeFormat(rtk.position?.x)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip size="small" label={`Y: ${safeFormat(rtk.position?.y)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip size="small" color="secondary" label={`Alt: ${safeFormat(rtk.position?.z)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Orientation */}
              <Paper variant="outlined" sx={{ p: 0.5 }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <HeightIcon sx={{ mr: 0.5, fontSize: 14 }} />
                  Orientation (°)
                </Typography>
                <Grid container spacing={0.5}>
                  <Grid item xs={4}>
                    <Chip size="small" label={`X: ${safeFormat(rtk.orientation?.x)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip size="small" label={`Y: ${safeFormat(rtk.orientation?.y)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip size="small" label={`Z: ${safeFormat(rtk.orientation?.z)}`} sx={{ height: 20, fontSize: '0.7rem', width: '100%' }} />
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TelemetryDisplay;