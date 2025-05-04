"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CombinedTelemetryData } from '../interfaces/telemetry';
import { TelemetryManager } from '../interfaces/services';
import { TelemetryManagerService } from '../services/telemetryManager';
import { MockLoRaService } from '../services/loraService';
import { MockRtkService } from '../services/rtkService';

interface TelemetryContextType {
  telemetryManager: TelemetryManager;
  latestData: CombinedTelemetryData | null;
  isLiveMode: boolean;
  setLiveMode: (isLive: boolean) => void;
  isLogging: boolean;
  startLogging: () => void;
  stopLogging: () => void;
  logFilePath: string | null;
  loadLogFile: (filePath: string) => Promise<void>;
  logData: CombinedTelemetryData[];
  currentLogIndex: number;
  setCurrentLogIndex: (index: number) => void;
  isPlaying: boolean;
  playLog: () => void;
  pauseLog: () => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

const defaultContextValue: TelemetryContextType = {
  telemetryManager: new TelemetryManagerService(),
  latestData: null,
  isLiveMode: true,
  setLiveMode: () => {},
  isLogging: false,
  startLogging: () => {},
  stopLogging: () => {},
  logFilePath: null,
  loadLogFile: async () => {},
  logData: [],
  currentLogIndex: 0,
  setCurrentLogIndex: () => {},
  isPlaying: false,
  playLog: () => {},
  pauseLog: () => {},
  playbackSpeed: 1,
  setPlaybackSpeed: () => {}
};

export const TelemetryContext = createContext<TelemetryContextType>(defaultContextValue);

export const useTelemetry = () => useContext(TelemetryContext);

interface TelemetryProviderProps {
  children: ReactNode;
}

export const TelemetryProvider: React.FC<TelemetryProviderProps> = ({ children }) => {
  const telemetryManager = React.useMemo(() => new TelemetryManagerService(), []);
  const [latestData, setLatestData] = useState<CombinedTelemetryData | null>(null);
  const [isLiveMode, setLiveMode] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [logFilePath, setLogFilePath] = useState<string | null>(null);
  const [logData, setLogData] = useState<CombinedTelemetryData[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackInterval, setPlaybackInterval] = useState<NodeJS.Timeout | null>(null);

  // Set up telemetry manager with mock services on first render
  useEffect(() => {
    const loraService = new MockLoRaService();
    const rtkService = new MockRtkService();

    telemetryManager.setLoRaService(loraService);
    telemetryManager.setRtkService(rtkService);

    // Subscribe to data updates
    telemetryManager.onDataUpdated((data) => {
      if (isLiveMode) {
        setLatestData(data);
      }
    });

    // Connect and start data streams (in a real app, you might want to do this on user action)
    const setupServices = async () => {
      await telemetryManager.connectLoRa('COM3'); // Default port, would be configurable in real app
      await telemetryManager.connectRtk('COM4'); // Default port, would be configurable in real app
      telemetryManager.startDataStreams();
    };

    if (isLiveMode) {
      setupServices();
    }

    // Cleanup on unmount
    return () => {
      telemetryManager.stopDataStreams();
      telemetryManager.disconnectLoRa();
      telemetryManager.disconnectRtk();
      if (playbackInterval) {
        clearInterval(playbackInterval);
      }
    };
  }, []);

  // Update isLogging state when telemetry manager's logging status changes
  useEffect(() => {
    setIsLogging(telemetryManager.isLogging());
  }, [telemetryManager]);

  // Handle log playback
  useEffect(() => {
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }

    if (isPlaying && !isLiveMode && logData.length > 0) {
      const interval = setInterval(() => {
        setCurrentLogIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= logData.length) {
            setIsPlaying(false);
            return prevIndex;
          }
          setLatestData(logData[nextIndex]);
          return nextIndex;
        });
      }, 1000 / playbackSpeed);
      
      setPlaybackInterval(interval);
    }

    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
      }
    };
  }, [isPlaying, isLiveMode, logData.length, playbackSpeed]);

  // Update latest data when current log index changes in playback mode
  useEffect(() => {
    if (!isLiveMode && logData.length > 0 && currentLogIndex < logData.length) {
      setLatestData(logData[currentLogIndex]);
    }
  }, [currentLogIndex, isLiveMode, logData]);

  const startLogging = () => {
    telemetryManager.startLogging();
    setIsLogging(true);
    setLogFilePath(telemetryManager.getLatestCombinedData()?.timestamp.toString() || null);
  };

  const stopLogging = () => {
    telemetryManager.stopLogging();
    setIsLogging(false);
  };

  const loadLogFile = async (filePath: string) => {
    const loadedData = await telemetryManager.loadLogFile(filePath);
    setLogData(loadedData);
    setLogFilePath(filePath);
    if (loadedData.length > 0) {
      setCurrentLogIndex(0);
      setLatestData(loadedData[0]);
    }
  };

  const playLog = () => {
    if (!isLiveMode && logData.length > 0) {
      setIsPlaying(true);
    }
  };

  const pauseLog = () => {
    setIsPlaying(false);
  };

  // Switch between live and playback modes
  useEffect(() => {
    if (isLiveMode) {
      telemetryManager.startDataStreams();
    } else {
      telemetryManager.stopDataStreams();
    }
  }, [isLiveMode]);

  const contextValue: TelemetryContextType = {
    telemetryManager,
    latestData,
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
  };

  return (
    <TelemetryContext.Provider value={contextValue}>
      {children}
    </TelemetryContext.Provider>
  );
};