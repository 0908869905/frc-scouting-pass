/**
 * 2026 FRC Events List - Build-time embedded data
 *
 * This file is generated during development and embedded into the build.
 * No network required at runtime - data is always available offline.
 *
 * To update: Ask Claude to refresh from TBA API
 * Generated: 2026-02-05 (sample data - will be updated when 2026 events are announced)
 */

export interface FRCEvent {
  key: string;
  name: string;
  shortName?: string;
  startDate: string;
  endDate: string;
  city?: string;
  country?: string;
}

export const EVENTS_2026: FRCEvent[] = [
  // Week 0
  { key: '2026week0', name: 'Week 0', startDate: '2026-02-22', endDate: '2026-02-22' },

  // Malaysia Regional (Team 6998 home event)
  { key: '2026mslr', name: 'Malaysia Regional', shortName: 'Malaysia', startDate: '2026-03-01', endDate: '2026-03-03', city: 'Kuala Lumpur', country: 'Malaysia' },

  // Taiwan Regional
  { key: '2026twrc', name: 'Taiwan Regional', shortName: 'Taiwan', startDate: '2026-03-08', endDate: '2026-03-10', city: 'Taipei', country: 'Taiwan' },

  // Sample US Regionals (placeholder data)
  { key: '2026txda', name: 'Dallas Regional', shortName: 'Dallas', startDate: '2026-03-15', endDate: '2026-03-17', city: 'Dallas', country: 'USA' },
  { key: '2026txho', name: 'Houston Regional', shortName: 'Houston', startDate: '2026-03-22', endDate: '2026-03-24', city: 'Houston', country: 'USA' },
  { key: '2026cala', name: 'Los Angeles Regional', shortName: 'LA', startDate: '2026-03-29', endDate: '2026-03-31', city: 'Los Angeles', country: 'USA' },

  // Championships
  { key: '2026cmptx', name: 'FIRST Championship - Houston', shortName: 'Houston Champs', startDate: '2026-04-15', endDate: '2026-04-18', city: 'Houston', country: 'USA' },
];

// Quick lookup by event key
export const EVENTS_MAP: Record<string, FRCEvent> = Object.fromEntries(
  EVENTS_2026.map(event => [event.key, event])
);
