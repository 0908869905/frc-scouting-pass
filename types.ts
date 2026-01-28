
export type MatchPhase =
  | 'PreMatch' | 'Auton' | 'Teleop' | 'PostMatch'
  | 'PitInfo' | 'PitRobot' | 'PitSpecs' // Pit phases
  | 'QRCode';

export type ScoutingMode = 'Match' | 'Pit';
export type Handedness = 'right' | 'left';

// 2026 REBUILT - Alliance with position (R1/R2/R3/B1/B2/B3)
export type Alliance = 'R1' | 'R2' | 'R3' | 'B1' | 'B2' | 'B3';

export enum MatchLevel {
  Practice = 'Practice',
  Quals = 'Quals',
  Playoffs = 'Playoffs',
  Test = 'Test'
}

// 2026 REBUILT - Auto Climb Status (only Level 1 available in Auto)
export enum AutoClimbStatus {
  None = 'None',
  Level1 = 'Level1',
  Failed = 'Failed'
}

// 2026 REBUILT - Teleop Climb Status (3 levels available)
export enum TeleClimbStatus {
  None = 'None',
  Level1 = 'Level1',
  Level2 = 'Level2',
  Level3 = 'Level3',
  Failed = 'Failed'
}

// Climb position options (5 positions)
export type ClimbPosition = 'LeftSide' | 'Left' | 'Center' | 'Right' | 'RightSide';

// Path point for autonomous route tracking (percentage-based coordinates 0-100)
export interface PathPoint {
  x: number;
  y: number;
}

// The core data structure collected during a match or pit scouting
export interface ScoutingData {
  mode: ScoutingMode;

  // --- PreMatch (Common) ---
  scouterName: string;
  eventCode: string;
  teamNumber: string;
  matchLevel: MatchLevel;
  matchNumber: number;
  alliance: Alliance; // 2026: Red or Blue only

  // --- Auto (20 seconds) ---
  autoPath: PathPoint[];         // Auto Path Tracking (preserved)
  autoClimbStatus: AutoClimbStatus; // Level1/Failed/None
  autoClimbTime: number;         // Seconds to climb
  autoClimbPosition: ClimbPosition; // 5 positions

  // --- Teleop (2:20) ---
  teleClimbStatus: TeleClimbStatus; // Level1-3/Failed/None
  teleClimbTime: number;         // Seconds to climb
  teleClimbPosition: ClimbPosition; // 5 positions
  bumpTrenchCount: number;       // Times crossed Bump & Trench
  fuelDroppedOnBumpCount: number; // Times dropped fuel on Bump crossing

  // --- Penalty (within Teleop) ---
  minorPenalty: number;          // Minor penalty count
  majorPenalty: number;          // Major penalty count

  // --- PostMatch (Other + Subjective) ---
  robotDied: boolean;            // Robot died/disabled (incl. tipped)
  almostTipped: boolean;         // Almost tipped (near miss)
  ridingOnBall: boolean;         // Riding on ball
  comments: string;              // Comments (single field)

  // --- Pit Scouting Fields ---
  pitDriveTrain: string;
  pitMotorType: string;
  pitLength: number;
  pitWidth: number;
  pitWeight: number;
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
  alliance: 'R1',
  teamNumber: '',

  // Auto
  autoPath: [],
  autoClimbStatus: AutoClimbStatus.None,
  autoClimbTime: 0,
  autoClimbPosition: 'Center',

  // Teleop
  teleClimbStatus: TeleClimbStatus.None,
  teleClimbTime: 0,
  teleClimbPosition: 'Center',
  bumpTrenchCount: 0,
  fuelDroppedOnBumpCount: 0,

  // Penalty (within Teleop)
  minorPenalty: 0,
  majorPenalty: 0,

  // PostMatch
  robotDied: false,
  almostTipped: false,
  ridingOnBall: false,
  comments: '',

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
