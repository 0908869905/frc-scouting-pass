
export type MatchPhase = 
  | 'PreMatch' | 'Auton' | 'Teleop' | 'PostMatch' 
  | 'PitInfo' | 'PitRobot' | 'PitSpecs' // Pit phases
  | 'QRCode';

export type ScoutingMode = 'Match' | 'Pit';
export type Handedness = 'right' | 'left';

export enum MatchLevel {
  Practice = 'Practice',
  Quals = 'Quals',
  Playoffs = 'Playoffs',
  Test = 'Test'
}

export enum RobotPosition {
  Red1 = 'Red 1',
  Red2 = 'Red 2',
  Red3 = 'Red 3',
  Blue1 = 'Blue 1',
  Blue2 = 'Blue 2',
  Blue3 = 'Blue 3'
}

export enum EndGameStatus {
  None = 'None',
  Parked = 'Parked',
  Level1 = 'Level 1',
  Level2 = 'Level 2',
  Level3 = 'Level 3',
  Failed = 'Failed'
}

// The core data structure collected during a match or pit scouting
export interface ScoutingData {
  mode: ScoutingMode;

  // --- Common ---
  scouterName: string;
  eventCode: string;
  teamNumber: string;

  // --- Match Scouting Fields ---
  matchLevel: MatchLevel;
  matchNumber: number;
  robotPosition: RobotPosition;
  
  // Auton
  autoLeave: boolean;
  autoFuel: number;        // Points: 1 per fuel in active hub
  autoTowerLevel1: boolean; // Points: 15 for Level 1 in Auto
  
  // Teleop
  teleFuel: number;        // Points: 1 per fuel in active hub
  teleTower: EndGameStatus; // Points: L2=20, L3=30

  // Post Match
  defenseRating: number; // 0-5
  driverRating: number; // 0-5
  speedRating: number; // 0-5
  defendedBy: string;
  robotDied: boolean;
  tippedOver: boolean;
  comments: string;
  tags: string[]; // Strategy Tags

  // --- Pit Scouting Fields ---
  pitDriveTrain: string;
  pitMotorType: string;
  pitLength: number; // inches or cm
  pitWidth: number;
  pitWeight: number; // lbs or kg
  pitCanFuel: boolean;
  pitCanTowerL1: boolean;
  pitCanTowerL2: boolean;
  pitCanTowerL3: boolean;
  pitAutoNotes: string;
}

// Extended type for stored history
export interface MatchRecord {
  id: string; // uuid
  data: ScoutingData;
  timestamp: number;
  synced: boolean;
}

export const INITIAL_DATA: ScoutingData = {
  mode: 'Match',
  scouterName: '',
  eventCode: '2026MSLR',
  matchLevel: MatchLevel.Quals,
  matchNumber: 1,
  robotPosition: RobotPosition.Red1,
  teamNumber: '',

  autoLeave: false,
  autoFuel: 0,
  autoTowerLevel1: false,

  teleFuel: 0,
  teleTower: EndGameStatus.None,

  defenseRating: 0,
  driverRating: 0,
  speedRating: 0,
  defendedBy: '',
  robotDied: false,
  tippedOver: false,
  comments: '',
  tags: [],

  // Pit defaults
  pitDriveTrain: 'Swerve',
  pitMotorType: 'Kraken',
  pitLength: 0,
  pitWidth: 0,
  pitWeight: 0,
  pitCanFuel: false,
  pitCanTowerL1: false,
  pitCanTowerL2: false,
  pitCanTowerL3: false,
  pitAutoNotes: ''
};
