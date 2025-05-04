import { RtkService } from "../interfaces/services";
import { RtkData, Vector3 } from "../interfaces/telemetry";

/**
 * Mock implementation of the RTK GPS service.
 * Replace this with an actual implementation that connects to the RTK GPS hardware.
 */
export class MockRtkService implements RtkService {
  private connected: boolean = false;
  private dataListeners: ((data: RtkData) => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private latestData: RtkData | null = null;

  async connect(port: string): Promise<boolean> {
    console.log(`Connecting to RTK GPS on port ${port}`);
    // Here you would implement the actual connection logic
    this.connected = true;
    return true;
  }

  async disconnect(): Promise<boolean> {
    console.log('Disconnecting from RTK GPS');
    this.stopDataStream();
    this.connected = false;
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getLatestData(): RtkData | null {
    return this.latestData;
  }

  startDataStream(): void {
    if (this.intervalId) {
      return; // Already streaming
    }

    // In a real implementation, you would set up event listeners for the RTK GPS hardware
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

  onDataReceived(callback: (data: RtkData) => void): void {
    this.dataListeners.push(callback);
  }

  private notifyListeners(data: RtkData): void {
    for (const listener of this.dataListeners) {
      listener(data);
    }
  }

  private generateMockData(): RtkData {
    const now = Date.now();
    return {
      timestamp: now,
      position: this.generatePosition(),
      orientation: this.generateOrientation()
    };
  }

  private generatePosition(): Vector3 {
    // Generate a simulated position with a bit of randomness
    // In a real implementation, this would come from the RTK GPS hardware
    return {
      x: 100 + Math.sin(Date.now() / 10000) * 50 + (Math.random() - 0.5) * 5,
      y: 100 + Math.cos(Date.now() / 10000) * 50 + (Math.random() - 0.5) * 5,
      z: 50 + Math.sin(Date.now() / 5000) * 20 + (Math.random() - 0.5) * 2
    };
  }

  private generateOrientation(): Vector3 {
    // Generate a simulated orientation with a bit of randomness
    // In a real implementation, this would come from the RTK GPS hardware
    return {
      x: (Math.sin(Date.now() / 2000) * 15) + (Math.random() - 0.5) * 2,
      y: (Math.cos(Date.now() / 2000) * 15) + (Math.random() - 0.5) * 2,
      z: (Date.now() / 10000) % 360
    };
  }
}