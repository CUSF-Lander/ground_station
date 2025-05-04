import { RocketTelemetry, RtkData, CombinedTelemetryData } from './telemetry';

// Interface for LoRa service
export interface LoRaService {
  connect(port: string): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): boolean;
  getLatestData(): RocketTelemetry | null;
  startDataStream(): void;
  stopDataStream(): void;
  onDataReceived(callback: (data: RocketTelemetry) => void): void;
}

// Interface for RTK service
export interface RtkService {
  connect(port: string): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): boolean;
  getLatestData(): RtkData | null;
  startDataStream(): void;
  stopDataStream(): void;
  onDataReceived(callback: (data: RtkData) => void): void;
}

// Interface for the data logging service
export interface LoggingService {
  startLogging(): void;
  stopLogging(): void;
  isLogging(): boolean;
  getLogFilePath(): string | null;
  loadLogFile(filePath: string): Promise<CombinedTelemetryData[]>;
  exportLog(format: 'csv' | 'json'): Promise<string>;
}

// Interface for the telemetry manager that combines data from all sources
export interface TelemetryManager {
  setLoRaService(service: LoRaService): void;
  setRtkService(service: RtkService): void;
  setLoggingService(service: LoggingService): void;
  
  connectLoRa(port: string): Promise<boolean>;
  connectRtk(port: string): Promise<boolean>;
  
  disconnectLoRa(): Promise<boolean>;
  disconnectRtk(): Promise<boolean>;
  
  startDataStreams(): void;
  stopDataStreams(): void;
  
  getLatestCombinedData(): CombinedTelemetryData | null;
  
  onDataUpdated(callback: (data: CombinedTelemetryData) => void): void;
  
  startLogging(): void;
  stopLogging(): void;
  isLogging(): boolean;
  
  loadLogFile(filePath: string): Promise<CombinedTelemetryData[]>;
}