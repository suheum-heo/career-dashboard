/** Month (1-12) a recruiting season begins; Aug 2026 – Jul 2027 is the 2026 season. */
export const SEASON_START_MONTH = 8;

export function seasonOf(date: Date): number {
  const year = date.getFullYear();
  return date.getMonth() + 1 >= SEASON_START_MONTH ? year : year - 1;
}

export function currentSeason(now = new Date()): number {
  return seasonOf(now);
}

export function seasonRange(season: number): { start: Date; end: Date } {
  return {
    start: new Date(season, SEASON_START_MONTH - 1, 1),
    end: new Date(season + 1, SEASON_START_MONTH - 1, 1),
  };
}

/** 2026 → "2026–27" */
export function formatSeason(season: number): string {
  return `${season}–${String(season + 1).slice(-2)}`;
}

export function parseSeason(value?: string | null): number | null {
  if (!value) return null;
  const season = Number(value);
  return Number.isInteger(season) && season > 1900 ? season : null;
}
