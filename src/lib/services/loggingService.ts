import { LoggingService } from "../interfaces/services";
import { CombinedTelemetryData, TelemetryLogEntry } from "../interfaces/telemetry";

/**
 * Service to handle logging telemetry data and replaying logs
 */
export class FileLoggingService implements LoggingService {
  private isCurrentlyLogging: boolean = false;
  private logData: TelemetryLogEntry[] = [];
  private logFilePath: string | null = null;

  startLogging(): void {
    if (this.isCurrentlyLogging) {
      return; // Already logging
    }
    
    this.isCurrentlyLogging = true;
    this.logData = [];
    this.logFilePath = `rocket_telemetry_${new Date().toISOString().replace(/:/g, '-')}.json`;
    console.log(`Started logging to ${this.logFilePath}`);
  }

  stopLogging(): void {
    if (!this.isCurrentlyLogging) {
      return; // Not logging
    }

    this.isCurrentlyLogging = false;
    console.log(`Stopped logging to ${this.logFilePath}`);

    // In a real implementation, you would save the log to a file here
    // For now, we'll just log to console
    console.log(`Would save log with ${this.logData.length} entries to ${this.logFilePath}`);
  }

  isLogging(): boolean {
    return this.isCurrentlyLogging;
  }

  getLogFilePath(): string | null {
    return this.logFilePath;
  }

  /**
   * Add a telemetry data entry to the log
   */
  addLogEntry(data: CombinedTelemetryData): void {
    if (!this.isCurrentlyLogging) {
      return;
    }

    this.logData.push({
      timestamp: data.timestamp,
      data: data
    });
  }

  async loadLogFile(filePath: string): Promise<CombinedTelemetryData[]> {
    // In a real implementation, you would load the log file from disk
    // For now, we'll just return mock data or an empty array
    console.log(`Loading log file: ${filePath}`);
    
    if (this.logData.length > 0 && this.logFilePath === filePath) {
      // Return our current log data if it matches the requested file
      return this.logData.map(entry => entry.data);
    }
    
    // In a real implementation, you would read the file from disk
    // For now, just return an empty array
    return [];
  }

  async exportLog(format: 'csv' | 'json'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(this.logData, null, 2);
    } else {
      // Convert to CSV
      const headers = ['timestamp', 'eulerCounter', 'eulerX', 'eulerY', 'eulerZ', 
                      'velocityX', 'velocityY', 'velocityZ',
                      'gravityX', 'gravityY', 'gravityZ',
                      'angAccelX', 'angAccelY', 'angAccelZ',
                      'linAccelX', 'linAccelY', 'linAccelZ',
                      'freeHeapSize', 'servoAngle',
                      'rtkPosX', 'rtkPosY', 'rtkPosZ',
                      'rtkOrientX', 'rtkOrientY', 'rtkOrientZ'];
      
      let csv = headers.join(',') + '\n';
      
      for (const entry of this.logData) {
        const { data } = entry;
        const lora = data.lora;
        const rtk = data.rtk;
        
        const values = [
          data.timestamp,
          lora?.eulerCounter || '',
          lora?.eulerAngles?.x || '',
          lora?.eulerAngles?.y || '',
          lora?.eulerAngles?.z || '',
          lora?.velocity?.x || '',
          lora?.velocity?.y || '',
          lora?.velocity?.z || '',
          lora?.gravity?.x || '',
          lora?.gravity?.y || '',
          lora?.gravity?.z || '',
          lora?.angularAcceleration?.x || '',
          lora?.angularAcceleration?.y || '',
          lora?.angularAcceleration?.z || '',
          lora?.linearAcceleration?.x || '',
          lora?.linearAcceleration?.y || '',
          lora?.linearAcceleration?.z || '',
          lora?.freeHeapSize || '',
          lora?.servoMotorAngle || '',
          rtk?.position?.x || '',
          rtk?.position?.y || '',
          rtk?.position?.z || '',
          rtk?.orientation?.x || '',
          rtk?.orientation?.y || '',
          rtk?.orientation?.z || ''
        ];
        
        csv += values.join(',') + '\n';
      }
      
      return csv;
    }
  }
}