import { MatchLevel, AutoClimbStatus, TeleClimbStatus, Alliance, ClimbPosition } from './types';

// Starting zone configuration for auto path validation
// Width = 7%, different offsets for red and blue alliances
// Red: left side (25-32%), Blue: right side (71.5-78.5%)
export const STARTING_ZONE_WIDTH = 5;
export const RED_STARTING_ZONE_OFFSET = 24;  // Red zone: X = 25-32%
export const BLUE_STARTING_ZONE_OFFSET = 71.5; // Blue zone: X = 71.5-78.5%

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

// Climb position options (5 positions: LeftSide, Left, Center, Right, RightSide)
export const CLIMB_POSITION_OPTIONS: ClimbPosition[] = ['LeftSide', 'Left', 'Center', 'Right', 'RightSide'];

// TSV column order for Match scouting - MUST match ScoutingData keys
// Note: autoPath is excluded - it goes in a separate QR code
// v1.6.0 (2026-04-21): 23 → 44 columns. First 17 unchanged; post 27 flattened
// (11 issue + 6 flag + 3 collision bool + 1 collision text + 5 rating + 1 comments).
// Removed legacy: robotDied / almostTipped / ridingOnBall / robotIssues / performance.
// v1.7.0 (2026-04-21): 44 → 47 columns. Add 3 fuel-action ratings
// (ratingIntakeFuel / ratingTransportFuel / ratingShootFuel) before `comments`.
export const TSV_SCHEMA_MATCH = [
  // PreMatch (6)
  'scouterName', 'eventCode', 'matchLevel', 'matchNumber', 'alliance', 'teamNumber',
  // Auto (3)
  'autoClimbStatus', 'autoClimbTime', 'autoClimbPosition',
  // Teleop (3)
  'bumpCount', 'trenchCount', 'fuelDroppedOnBumpCount',
  // Penalty (2)
  'minorPenalty', 'majorPenalty',
  // Climb (3)
  'teleClimbStatus', 'teleClimbTime', 'teleClimbPosition',
  // --- 17 above unchanged ---
  // PostMatch Issues (11) — 0/1
  'issueNoShow', 'issueCrashed', 'issueEStop', 'issueAStop', 'issueLowVoltage',
  'issueIntakeStuck', 'issueShooterOff', 'issueStuckBump', 'issueHitTrench',
  'issuePartFell', 'issueMovement',
  // PostMatch Flags (6) — 0/1
  'flagYellowCard', 'flagRedCard', 'flagBelowExpected', 'flagTipped',
  'flagRidingFuel', 'flagStuckBall',
  // PostMatch Collision (3 bool + 1 text)
  'hasCollision', 'collisionField', 'collisionRobot', 'collisionTeamNumbers',
  // PostMatch Ratings (8) — good/ok/bad or empty
  'ratingPushTrench', 'ratingPushBump', 'ratingShoot', 'ratingHuman', 'ratingDefense',
  'ratingIntakeFuel', 'ratingTransportFuel', 'ratingShootFuel',
  // PostMatch free-text (1)
  'comments',
];

// Schema for path-only QR code (identifier + path data)
export const TSV_SCHEMA_PATH = [
  'eventCode', 'matchNumber', 'teamNumber', 'alliance', 'autoPath'
];

export const TSV_SCHEMA_PIT = [
  'scouterName', 'eventCode', 'teamNumber',
  'pitDriveTrain', 'pitMotorType', 'pitLength', 'pitWidth', 'pitWeight',
  'pitCanFuel',
  'pitCanTowerL1', 'pitCanTowerL2', 'pitCanTowerL3',
  'pitAutoNotes'
];
