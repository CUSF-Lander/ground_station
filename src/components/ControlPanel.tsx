"use client";

import React, { useState } from 'react';
import { useTelemetry } from '../lib/contexts/TelemetryContext';

// MUI components
import {
  Box,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SpeedIcon from '@mui/icons-material/Speed';

const ControlPanel: React.FC = () => {
  const {
    isLiveMode,
    setLiveMode,
    isLogging,
    startLogging,
    stopLogging,
    logFilePath,
    loadLogFile,
    logData,
    currentLogIndex,
    setCurrentLogIndex,
    isPlaying,
    playLog,
    pauseLog,
    playbackSpeed,
    setPlaybackSpeed
  } = useTelemetry();

  const [selectedLogFile, setSelectedLogFile] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedLogFile(file.name);
      
      if (isLiveMode) {
        setLiveMode(false);
      }
      await loadLogFile(file.name);
    }
  };

  const handlePlaybackSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaybackSpeed(Number(e.target.value));
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (logData.length > 0) {
      setCurrentLogIndex(newValue as number);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column'}}>
      <Box sx={{ display: 'flex', flexDirection: 'row'}}>
        {/* Live Mode Controls */}
      {isLiveMode && (
        <Box sx={{flex: 1}}>
          {isLogging ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopLogging}
              size="small"
            >
              Stop Recording
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={<FiberManualRecordIcon sx={{ animation: 'pulse 1.5s infinite' }} />}
              onClick={startLogging}
              size="small"
            >
              Start Recording
            </Button>
          )}

          {isLogging && logFilePath && (
            <Chip 
              label={`Recording to: ${logFilePath}`} 
              color="info" 
              size="small" 
              variant="outlined" 
              sx={{ mb: 1 }}
            />
          )}
          {/* <Button 
            variant="outlined" 
            size="small" 
            startIcon={<SignalCellularAltIcon />}
          >
            Configure LoRa
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<GpsFixedIcon />}
          >
            Configure RTK GPS
          </Button> */}
        </Box>
      )}

      {/* Playback Mode Controls */}
      {!isLiveMode && (
        <Box sx={{ flex: 1 }}>
          <Box sx={{ width: '60%', display: 'block'}}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">
                Playback Controls
              </Typography>
              
              <FormControl sx={{ width: 120 }} size="small">
                <InputLabel id="speed-select-label">Speed</InputLabel>
                <Select
                  labelId="speed-select-label"
                  value={playbackSpeed}
                  label="Speed"
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                >
                  <MenuItem value={0.25}>0.25x</MenuItem>
                  <MenuItem value={0.5}>0.5x</MenuItem>
                  <MenuItem value={1}>1x</MenuItem>
                  <MenuItem value={2}>2x</MenuItem>
                  <MenuItem value={4}>4x</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            
            <Box sx={{ mb: 2 }}>
              <input
                type="file"
                id="logFile"
                accept=".json,.csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button
                component="label"
                htmlFor="logFile"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                size="small"
              >
                Load Log File
              </Button>
              {selectedLogFile && (
                <Chip 
                  label={selectedLogFile} 
                  size="small" 
                  color="secondary" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Box>
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{display: 'inline-block'}}>
              <IconButton 
                color="primary" 
                onClick={isPlaying ? pauseLog : playLog}
                disabled={logData.length === 0}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              
              {logData.length > 0 && (
                <Typography variant="body2" sx={{ minWidth: 100 }}>
                  Frame {currentLogIndex + 1} of {logData.length}
                </Typography>
              )}
              
              <Box sx={{ width: '100%' }}>
                {logData.length > 0 && (
                  <Slider
                    size="small"
                    min={0}
                    max={logData.length - 1}
                    value={currentLogIndex}
                    onChange={handleSliderChange}
                    aria-label="Playback position"
                  />
                )}
              </Box>
            </Stack>
          </Box>
          
          <Box sx={{ width: '40%', textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>
              Playback Info
            </Typography>
            
            {logData.length > 0 ? (
              <Stack spacing={1}>
                <Chip 
                  icon={<SpeedIcon />}
                  label={`${logData.length} data points`} 
                  color="info" 
                  size="small" 
                />
                <Button 
                  variant="outlined" 
                  size="small" 
                  disabled={logData.length === 0}
                >
                  Export Analysis
                </Button>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No log data loaded
              </Typography>
            )}
          </Box>
        </Box>
      )}


      
        <Box>
          <ToggleButtonGroup
            value={isLiveMode ? 'live' : 'playback'}
            exclusive
            onChange={(e, value) => value && setLiveMode(value === 'live')}
            size="small"
          >
            <ToggleButton value="live" color="primary">
              Live Mode
            </ToggleButton>
            <ToggleButton value="playback" color="primary">
              Playback Mode
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      
      
    </Box>
  );
};

export default ControlPanel;