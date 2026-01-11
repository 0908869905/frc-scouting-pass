import { MatchLevel, RobotPosition, EndGameStatus } from './types';

export const APP_CONFIG = {
  teamName: "6998",
  appName: "Scouting PASS",
  year: 2026,
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbxRad3OJI_i0k9oEJhC65YxGxvxYbIM0tnMH66scmFCtHxIYtI-Ihno4sySS2VTFDSW/exec", // Replace with actual URL
  tbaApiKey: "YOUR_TBA_API_KEY_HERE" // Optional
};

export const MATCH_LEVEL_OPTIONS = Object.values(MatchLevel);

// Reordered to display Red 1-3 on the left column and Blue 1-3 on the right column
export const ROBOT_POSITION_OPTIONS = [
  RobotPosition.Red1, RobotPosition.Blue1,
  RobotPosition.Red2, RobotPosition.Blue2,
  RobotPosition.Red3, RobotPosition.Blue3
];

export const ENDGAME_OPTIONS = Object.values(EndGameStatus);

// This order dictates the TSV column order. MUST match the ScoutingData keys.
export const TSV_SCHEMA_MATCH = [
  'scouterName', 'eventCode', 'matchLevel', 'matchNumber', 'robotPosition', 'teamNumber',
  'autoLeave', 'autoFuel', 'autoTowerLevel1',
  'teleFuel', 'teleTower',
  'defenseRating', 'driverRating', 'speedRating', 'defendedBy',
  'robotDied', 'tippedOver', 'comments'
];

export const TSV_SCHEMA_PIT = [
  'scouterName', 'eventCode', 'teamNumber',
  'pitDriveTrain', 'pitMotorType', 'pitLength', 'pitWidth', 'pitWeight',
  'pitCanFuel',
  'pitCanTowerL1', 'pitCanTowerL2', 'pitCanTowerL3',
  'pitAutoNotes'
];
