/**
 * Event Match Schedule - Build-time embedded data
 *
 * This file contains match schedules for specific events.
 * Data is generated from TBA API during development and embedded into the build.
 * No network required at runtime.
 *
 * Format: matchNumber -> { red: [team1, team2, team3], blue: [team1, team2, team3] }
 *
 * To update: Ask Claude to refresh from TBA API with command:
 *   "請更新 2026mslr 賽程"
 *
 * Generated: 2026-02-10 (team list real, match schedule TBD - event starts 2026-03-18)
 */

export interface MatchAlliances {
  red: string[];   // 3 team numbers as strings
  blue: string[];  // 3 team numbers as strings
}

export interface EventSchedule {
  eventKey: string;
  eventName: string;
  generatedAt: string;
  totalMatches: number;
  teams: string[];  // all registered team numbers
  matches: Record<number, MatchAlliances>;
}

// Magnolia Regional 2026 - 45 teams registered (match schedule TBD)
export const SCHEDULE_2026MSLR: EventSchedule = {
  eventKey: '2026mslr',
  eventName: 'Magnolia Regional',
  generatedAt: '2026-02-10',
  totalMatches: 0,
  teams: [
    '364', '456', '538', '590', '1421', '1912', '1927', '2221', '2556', '2992',
    '3039', '3606', '3616', '3753', '4087', '4107', '4336', '4400', '5045', '5863',
    '5971', '6184', '6998', '7094', '7474', '8044', '8808', '9153', '9309', '9405',
    '9503', '9717', '9734', '10101', '10217', '10309', '10661', '10929', '10943', '10961',
    '11107', '11265', '11287', '11343', '11345',
  ],
  matches: {
    // Match schedule will be available after 2026-03-18
    // Run "/tba matches 2026mslr" to update
  }
};

// All schedules indexed by event key
export const ALL_SCHEDULES: Record<string, EventSchedule> = {
  '2026mslr': SCHEDULE_2026MSLR,
};

/**
 * Get match teams for a specific event and match number
 * @returns MatchAlliances or null if not found
 */
export function getMatchTeams(eventKey: string, matchNumber: number): MatchAlliances | null {
  const schedule = ALL_SCHEDULES[eventKey.toLowerCase()];
  if (!schedule) return null;
  return schedule.matches[matchNumber] || null;
}

/**
 * Get all registered teams for an event
 * @returns team number array or empty array
 */
export function getEventTeams(eventKey: string): string[] {
  const schedule = ALL_SCHEDULES[eventKey.toLowerCase()];
  if (!schedule) return [];
  return schedule.teams;
}

/**
 * Check if schedule exists for an event
 */
export function hasSchedule(eventKey: string): boolean {
  return eventKey.toLowerCase() in ALL_SCHEDULES;
}
