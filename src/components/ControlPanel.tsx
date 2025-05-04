"use client";

import React, { useState } from 'react';
import { useTelemetry } from '../lib/contexts/TelemetryContext';

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
      
      // In a real implementation, you'd read the file and load it
      // For now we'll just use the name as a mock path
      if (isLiveMode) {
        setLiveMode(false);
      }
      await loadLogFile(file.name);
    }
  };

  const handleModeSwitch = (mode: 'live' | 'playback') => {
    setLiveMode(mode === 'live');
  };

  const handlePlaybackSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaybackSpeed(Number(e.target.value));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (logData.length > 0) {
      const index = parseInt(e.target.value, 10);
      setCurrentLogIndex(index);
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-white">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Control Panel</h2>
        
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded ${isLiveMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleModeSwitch('live')}
          >
            Live Mode
          </button>
          <button
            className={`px-3 py-1 rounded ${!isLiveMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleModeSwitch('playback')}
          >
            Playback Mode
          </button>
        </div>
      </div>

      {/* Live Mode Controls */}
      {isLiveMode && (
        <div className="border rounded p-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Live Data Controls</h3>
            
            <div>
              {isLogging ? (
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  onClick={stopLogging}
                >
                  Stop Recording
                </button>
              ) : (
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  onClick={startLogging}
                >
                  Start Recording
                </button>
              )}
            </div>
          </div>

          {isLogging && logFilePath && (
            <div className="mt-2 text-sm text-gray-600">
              Recording to: {logFilePath}
            </div>
          )}
          
          <div className="mt-4 text-sm">
            <p>Connect additional hardware:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <button className="border px-2 py-1 rounded bg-white hover:bg-gray-100">
                Configure LoRa
              </button>
              <button className="border px-2 py-1 rounded bg-white hover:bg-gray-100">
                Configure RTK GPS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playback Mode Controls */}
      {!isLiveMode && (
        <div className="border rounded p-3 bg-gray-50">
          <div className="flex flex-wrap justify-between items-center mb-2">
            <h3 className="font-medium">Playback Controls</h3>
            
            <div className="flex space-x-2">
              <label className="flex items-center">
                <span className="mr-2 text-sm">Speed:</span>
                <select 
                  className="border rounded px-2 py-1"
                  value={playbackSpeed}
                  onChange={handlePlaybackSpeedChange}
                >
                  <option value={0.25}>0.25x</option>
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <input
              type="file"
              id="logFile"
              accept=".json,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="logFile"
              className="cursor-pointer inline-block bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-800 px-3 py-1 rounded"
            >
              Load Log File
            </label>
            {selectedLogFile && (
              <span className="ml-2 text-sm text-gray-600">
                Selected: {selectedLogFile}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            {isPlaying ? (
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                onClick={pauseLog}
              >
                Pause
              </button>
            ) : (
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                onClick={playLog}
                disabled={logData.length === 0}
              >
                Play
              </button>
            )}
            
            {logData.length > 0 && (
              <span className="text-sm">
                Frame {currentLogIndex + 1} of {logData.length}
              </span>
            )}
          </div>
          
          {logData.length > 0 && (
            <div>
              <input
                type="range"
                min={0}
                max={logData.length - 1}
                value={currentLogIndex}
                onChange={handleSliderChange}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ControlPanel;