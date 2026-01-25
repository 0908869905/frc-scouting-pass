import { MatchLevel, AutoClimbStatus, TeleClimbStatus, Alliance } from './types';

// Starting zone configuration for auto path validation
// Width = 20%, offset from edge = 40% (2 * width)
// Both alliances: starting zone is X = 40-60%
export const STARTING_ZONE_WIDTH = 20;
export const STARTING_ZONE_OFFSET = 40;

export const APP_CONFIG = {
  teamName: "6998",
  appName: "Scouting PASS",
  year: 2026,
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbxRad3OJI_i0k9oEJhC65YxGxvxYbIM0tnMH66scmFCtHxIYtI-Ihno4sySS2VTFDSW/exec",
  tbaApiKey: "YOUR_TBA_API_KEY_HERE"
};

export const MATCH_LEVEL_OPTIONS = Object.values(MatchLevel);

// 2026 REBUILT - Alliance options (Red/Blue only)
export const ALLIANCE_OPTIONS: Alliance[] = ['Red', 'Blue'];

// 2026 REBUILT - Auto Climb options (only Level 1 in auto)
export const AUTO_CLIMB_OPTIONS = Object.values(AutoClimbStatus);

// 2026 REBUILT - Teleop Climb options (3 levels)
export const TELE_CLIMB_OPTIONS = Object.values(TeleClimbStatus);

// TSV column order for Match scouting - MUST match ScoutingData keys
// Note: autoPath is excluded - it goes in a separate QR code
export const TSV_SCHEMA_MATCH = [
  // PreMatch
  'scouterName', 'eventCode', 'matchLevel', 'matchNumber', 'alliance', 'teamNumber',
  // Auto
  'autoFuel', 'autoClimbStatus', 'autoClimbTime',
  // Teleop
  'teleFuel', 'teleClimbStatus', 'teleClimbTime', 'bumpTrenchCount', 'fuelDroppedOnBump',
  // Penalty
  'penaltyCount', 'yellowCard', 'redCard',
  // PostMatch
  'robotDied', 'almostTipped', 'ridingOnBall',
  'defenseRating', 'driverSkill', 'speedRating',
  'comments', 'subjectiveNotes'
];

// Schema for path-only QR code (identifier + path data)
export const TSV_SCHEMA_PATH = [
  'eventCode', 'matchNumber', 'teamNumber', 'autoPath'
];

export const TSV_SCHEMA_PIT = [
  'scouterName', 'eventCode', 'teamNumber',
  'pitDriveTrain', 'pitMotorType', 'pitLength', 'pitWidth', 'pitWeight',
  'pitCanFuel',
  'pitCanTowerL1', 'pitCanTowerL2', 'pitCanTowerL3',
  'pitAutoNotes'
];
