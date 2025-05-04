// Vector3 interface for 3D data
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Timestamp interface for tracking when data was received
export interface Timestamp {
  timestamp: number;  // Unix timestamp in milliseconds
}

// Interface for LoRa telemetry data from the rocket
export interface RocketTelemetry extends Timestamp {
  eulerCounter: number;
  eulerAngles: Vector3;
  velocity: Vector3;
  gravity: Vector3;
  angularAcceleration: Vector3;
  linearAcceleration: Vector3;
  freeHeapSize: number;
  servoMotorAngle: number;
}

// Interface for RTK GPS data
export interface RtkData extends Timestamp {
  position: Vector3;  // position in 3D space
  orientation: Vector3;  // orientation angles
}

// Combined data from all sources
export interface CombinedTelemetryData extends Timestamp {
  lora?: RocketTelemetry;  // Optional because it might not always be available
  rtk?: RtkData;  // Optional because it might not always be available
}

// Interface for telemetry log file entries
export interface TelemetryLogEntry extends Timestamp {
  data: CombinedTelemetryData;
}