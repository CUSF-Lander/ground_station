/**
 * Format a timestamp into a readable date and time string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
}

/**
 * Format a timestamp as HH:MM:SS
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Get the elapsed time in seconds since a given timestamp
 */
export function getElapsedSeconds(startTimestamp: number, endTimestamp: number = Date.now()): number {
  return (endTimestamp - startTimestamp) / 1000;
}