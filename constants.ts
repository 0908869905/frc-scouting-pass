import { MatchLevel, RobotPosition, PickupSource, EndGameStatus } from './types';

export const APP_CONFIG = {
  teamName: "6998",
  appName: "Scouting PASS",
  year: 2025,
  googleScriptUrl: "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE", // Replace with actual URL
  tbaApiKey: "YOUR_TBA_API_KEY_HERE" // Optional
};

export const MATCH_LEVEL_OPTIONS = Object.values(MatchLevel);

// Reordered to display Red 1-3 on the left column and Blue 1-3 on the right column
export const ROBOT_POSITION_OPTIONS = [
  RobotPosition.Red1, RobotPosition.Blue1,
  RobotPosition.Red2, RobotPosition.Blue2,
  RobotPosition.Red3, RobotPosition.Blue3
];

export const PICKUP_SOURCE_OPTIONS = Object.values(PickupSource);
export const ENDGAME_OPTIONS = Object.values(EndGameStatus);

// This order dictates the TSV column order. MUST match the ScoutingData keys.
export const TSV_SCHEMA = [
  'scouterName', 'eventCode', 'matchLevel', 'matchNumber', 'robotPosition', 'teamNumber', 'humanPlayerPresent',
  'autoLeave', 
  'autoCoralL1Success', 'autoCoralL1Fail', 
  'autoCoralL2Success', 'autoCoralL2Fail', 
  'autoCoralL3Success', 'autoCoralL3Fail', 
  'autoCoralL4Success', 'autoCoralL4Fail',
  'autoProcessorSuccess', 'autoProcessorFail',
  'autoNetSuccess', 'autoNetFail',
  
  'teleCoralL1Success', 'teleCoralL1Fail', 
  'teleCoralL2Success', 'teleCoralL2Fail', 
  'teleCoralL3Success', 'teleCoralL3Fail', 
  'teleCoralL4Success', 'teleCoralL4Fail',
  'teleProcessorSuccess', 'teleProcessorFail',
  'teleNetSuccess', 'teleNetFail',
  
  'telePickupSource', 'teleOpponentProcessor', 'teleBargeTime', 'teleEndGame',
  
  'defenseRating', 'driverRating', 'speedRating', 'defendedBy', 'coopBonus', 'algaeRemaning',
  'robotDied', 'tippedOver', 'droppedCoral', 'droppedAlgae', 'comments'
];