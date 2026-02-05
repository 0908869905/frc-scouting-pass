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
 * Generated: 2026-02-05 (sample data - will be updated when schedule is published)
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
  matches: Record<number, MatchAlliances>;
}

// Malaysia Regional 2026 - Sample schedule (will be replaced with real data)
export const SCHEDULE_2026MSLR: EventSchedule = {
  eventKey: '2026mslr',
  eventName: 'Malaysia Regional',
  generatedAt: '2026-02-05',
  totalMatches: 50,
  matches: {
    1: { red: ['6998', '7870', '8084'], blue: ['7421', '8513', '9254'] },
    2: { red: ['7169', '8255', '9012'], blue: ['6998', '7654', '8123'] },
    3: { red: ['7421', '8084', '9254'], blue: ['7169', '7870', '8513'] },
    4: { red: ['8123', '8255', '9012'], blue: ['6998', '7654', '8084'] },
    5: { red: ['7169', '7421', '8513'], blue: ['7870', '9012', '9254'] },
    6: { red: ['6998', '8084', '8255'], blue: ['7654', '8123', '7421'] },
    7: { red: ['7870', '9254', '7169'], blue: ['8513', '9012', '8123'] },
    8: { red: ['7654', '8084', '7421'], blue: ['6998', '8255', '7870'] },
    9: { red: ['9012', '9254', '8513'], blue: ['7169', '8123', '8084'] },
    10: { red: ['6998', '7421', '7654'], blue: ['8255', '7870', '9254'] },
    // ... more matches would be added when real schedule is available
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
 * Check if schedule exists for an event
 */
export function hasSchedule(eventKey: string): boolean {
  return eventKey.toLowerCase() in ALL_SCHEDULES;
}
