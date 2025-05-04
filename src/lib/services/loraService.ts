import { LoRaService } from "../interfaces/services";
import { RocketTelemetry, Vector3 } from "../interfaces/telemetry";

/**
 * Mock implementation of the LoRa service.
 * Replace this with an actual implementation that connects to the LoRa hardware.
 */
export class MockLoRaService implements LoRaService {
  private connected: boolean = false;
  private dataListeners: ((data: RocketTelemetry) => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private latestData: RocketTelemetry | null = null;

  async connect(port: string): Promise<boolean> {
    console.log(`Connecting to LoRa on port ${port}`);
    // Here you would implement the actual connection logic
    this.connected = true;
    return true;
  }

  async disconnect(): Promise<boolean> {
    console.log('Disconnecting from LoRa');
    this.stopDataStream();
    this.connected = false;
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getLatestData(): RocketTelemetry | null {
    return this.latestData;
  }

  startDataStream(): void {
    if (this.intervalId) {
      return; // Already streaming
    }

    // In a real implementation, you would set up event listeners for the LoRa hardware
    // For mock purposes, we'll generate some data at regular intervals
    this.intervalId = setInterval(() => {
      const data = this.generateMockData();
      this.latestData = data;
      this.notifyListeners(data);
    }, 1000); // Generate data every second
  }

  stopDataStream(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onDataReceived(callback: (data: RocketTelemetry) => void): void {
    this.dataListeners.push(callback);
  }

  private notifyListeners(data: RocketTelemetry): void {
    for (const listener of this.dataListeners) {
      listener(data);
    }
  }

  private generateMockData(): RocketTelemetry {
    const now = Date.now();
    return {
      timestamp: now,
      eulerCounter: Math.floor(now / 1000) % 10000,
      eulerAngles: this.generateRandomVector(),
      velocity: this.generateRandomVector(),
      gravity: { x: 0, y: 0, z: -9.81 },
      angularAcceleration: this.generateRandomVector(),
      linearAcceleration: this.generateRandomVector(),
      freeHeapSize: 10000 + Math.floor(Math.random() * 5000),
      servoMotorAngle: Math.random() * 180
    };
  }

  private generateRandomVector(): Vector3 {
    return {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10
    };
  }
}