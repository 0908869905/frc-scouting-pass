import { MatchLevel, AutoClimbStatus, TeleClimbStatus, Alliance, ClimbSide } from './types';

// Starting zone configuration for auto path validation
// Width = 7%, different offsets for red and blue alliances
// Red: left side (18-25%), Blue: right side (75-82%)
export const STARTING_ZONE_WIDTH = 7;
export const RED_STARTING_ZONE_OFFSET = 18;  // Red zone: X = 18-25%
export const BLUE_STARTING_ZONE_OFFSET = 75; // Blue zone: X = 75-82%

export const APP_CONFIG = {
  teamName: "6998",
  appName: "Scouting PASS",
  year: 2026,
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbxRad3OJI_i0k9oEJhC65YxGxvxYbIM0tnMH66scmFCtHxIYtI-Ihno4sySS2VTFDSW/exec",
  tbaApiKey: "YOUR_TBA_API_KEY_HERE"
};

export const MATCH_LEVEL_OPTIONS = Object.values(MatchLevel);

// 2026 REBUILT - Alliance options with position (R1/R2/R3/B1/B2/B3)
export const ALLIANCE_OPTIONS: Alliance[] = ['R1', 'R2', 'R3', 'B1', 'B2', 'B3'];

// 2026 REBUILT - Auto Climb options (only Level 1 in auto)
export const AUTO_CLIMB_OPTIONS = Object.values(AutoClimbStatus);

// 2026 REBUILT - Teleop Climb options (3 levels)
export const TELE_CLIMB_OPTIONS = Object.values(TeleClimbStatus);

// Climb side options (Left/Center/Right)
export const CLIMB_SIDE_OPTIONS: ClimbSide[] = ['None', 'Left', 'Center', 'Right'];

// TSV column order for Match scouting - MUST match ScoutingData keys
// Note: autoPath is excluded - it goes in a separate QR code
export const TSV_SCHEMA_MATCH = [
  // PreMatch
  'scouterName', 'eventCode', 'matchLevel', 'matchNumber', 'alliance', 'teamNumber',
  // Auto
  'autoClimbStatus', 'autoClimbTime', 'autoClimbSide',
  // Teleop
  'teleClimbStatus', 'teleClimbTime', 'teleClimbSide', 'bumpTrenchCount', 'fuelDroppedOnBumpCount',
  // Penalty (within Teleop)
  'penaltyCount', 'minorPenalty', 'majorPenalty',
  // PostMatch
  'robotDied', 'almostTipped', 'ridingOnBall',
  'comments'
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
