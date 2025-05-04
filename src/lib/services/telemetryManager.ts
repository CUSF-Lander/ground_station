import { LoRaService, RtkService, TelemetryManager, LoggingService } from "../interfaces/services";
import { CombinedTelemetryData, RocketTelemetry, RtkData } from "../interfaces/telemetry";
import { FileLoggingService } from "./loggingService";

/**
 * Manager to coordinate telemetry data from multiple sources
 */
export class TelemetryManagerService implements TelemetryManager {
  private loraService: LoRaService | null = null;
  private rtkService: RtkService | null = null;
  private loggingService: LoggingService | null = null;
  
  private latestLoraData: RocketTelemetry | null = null;
  private latestRtkData: RtkData | null = null;
  
  private dataUpdateCallbacks: ((data: CombinedTelemetryData) => void)[] = [];

  constructor() {
    // Initialize with a default logging service if none is provided
    this.loggingService = new FileLoggingService();
  }

  setLoRaService(service: LoRaService): void {
    this.loraService = service;
    
    // Set up data handler
    service.onDataReceived((data) => {
      this.latestLoraData = data;
      this.notifyDataUpdated();
    });
  }

  setRtkService(service: RtkService): void {
    this.rtkService = service;
    
    // Set up data handler
    service.onDataReceived((data) => {
      this.latestRtkData = data;
      this.notifyDataUpdated();
    });
  }

  setLoggingService(service: LoggingService): void {
    this.loggingService = service;
  }
  
  async connectLoRa(port: string): Promise<boolean> {
    if (!this.loraService) {
      console.error('LoRa service not set');
      return false;
    }
    
    return this.loraService.connect(port);
  }
  
  async connectRtk(port: string): Promise<boolean> {
    if (!this.rtkService) {
      console.error('RTK service not set');
      return false;
    }
    
    return this.rtkService.connect(port);
  }
  
  async disconnectLoRa(): Promise<boolean> {
    if (!this.loraService) {
      console.error('LoRa service not set');
      return false;
    }
    
    return this.loraService.disconnect();
  }
  
  async disconnectRtk(): Promise<boolean> {
    if (!this.rtkService) {
      console.error('RTK service not set');
      return false;
    }
    
    return this.rtkService.disconnect();
  }
  
  startDataStreams(): void {
    if (this.loraService) {
      this.loraService.startDataStream();
    }
    
    if (this.rtkService) {
      this.rtkService.startDataStream();
    }
  }
  
  stopDataStreams(): void {
    if (this.loraService) {
      this.loraService.stopDataStream();
    }
    
    if (this.rtkService) {
      this.rtkService.stopDataStream();
    }
  }
  
  getLatestCombinedData(): CombinedTelemetryData | null {
    if (!this.latestLoraData && !this.latestRtkData) {
      return null;
    }
    
    // Get the most recent timestamp
    const loraTimestamp = this.latestLoraData?.timestamp || 0;
    const rtkTimestamp = this.latestRtkData?.timestamp || 0;
    const timestamp = Math.max(loraTimestamp, rtkTimestamp);
    
    return {
      timestamp,
      lora: this.latestLoraData || undefined,
      rtk: this.latestRtkData || undefined
    };
  }
  
  onDataUpdated(callback: (data: CombinedTelemetryData) => void): void {
    this.dataUpdateCallbacks.push(callback);
  }
  
  startLogging(): void {
    if (!this.loggingService) {
      console.error('Logging service not set');
      return;
    }
    
    this.loggingService.startLogging();
  }
  
  stopLogging(): void {
    if (!this.loggingService) {
      console.error('Logging service not set');
      return;
    }
    
    this.loggingService.stopLogging();
  }
  
  isLogging(): boolean {
    return this.loggingService?.isLogging() || false;
  }
  
  async loadLogFile(filePath: string): Promise<CombinedTelemetryData[]> {
    if (!this.loggingService) {
      console.error('Logging service not set');
      return [];
    }
    
    return this.loggingService.loadLogFile(filePath);
  }
  
  private notifyDataUpdated(): void {
    const combinedData = this.getLatestCombinedData();
    if (!combinedData) {
      return;
    }
    
    // Log the data if logging is enabled
    if (this.loggingService?.isLogging() && this.loggingService instanceof FileLoggingService) {
      (this.loggingService as FileLoggingService).addLogEntry(combinedData);
    }
    
    // Notify all subscribers
    for (const callback of this.dataUpdateCallbacks) {
      callback(combinedData);
    }
  }
}