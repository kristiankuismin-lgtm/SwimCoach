/** Muuntaa millisekunnit mm:ss.hh muotoon */
export function msToTimeString(ms: number): string {
  const totalSeconds = Math.floor(ms / 10) / 100;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const secStr = seconds.toFixed(2).padStart(5, "0");
  return minutes > 0 ? `${minutes}:${secStr}` : secStr;
}

/** Muuntaa mm:ss.hh merkkijonon millisekunneiksi */
export function timeStringToMs(time: string): number {
  const parts = time.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return Math.round((minutes * 60 + seconds) * 1000);
  }
  return Math.round(parseFloat(time) * 1000);
}

/** Laskee parannusprosentin: positiivinen = parantunut */
export function improvementPct(baselineMs: number, currentMs: number): number {
  return Math.round(((baselineMs - currentMs) / baselineMs) * 1000) / 10;
}
