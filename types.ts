
export type MatchPhase =
  | 'PreMatch' | 'Auton' | 'Teleop' | 'Penalty' | 'PostMatch'
  | 'PitInfo' | 'PitRobot' | 'PitSpecs' // Pit phases
  | 'QRCode';

export type ScoutingMode = 'Match' | 'Pit';
export type Handedness = 'right' | 'left';

// 2026 REBUILT - Alliance (Red/Blue only, no position)
export type Alliance = 'Red' | 'Blue';

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
  autoFuel: number;              // Fuel scored count
  autoClimbStatus: AutoClimbStatus; // Level1/Failed/None
  autoClimbTime: number;         // Seconds to climb

  // --- Teleop (2:20) ---
  teleFuel: number;              // Fuel scored count
  teleClimbStatus: TeleClimbStatus; // Level1-3/Failed/None
  teleClimbTime: number;         // Seconds to climb
  bumpTrenchCount: number;       // Times crossed Bump & Trench
  fuelDroppedOnBump: boolean;    // Dropped fuel on Bump crossing

  // --- Penalty ---
  penaltyCount: number;          // Penalty count
  yellowCard: boolean;           // Yellow card received
  redCard: boolean;              // Red card received

  // --- PostMatch (Other + Subjective) ---
  robotDied: boolean;            // Robot died/disabled (incl. tipped)
  almostTipped: boolean;         // Almost tipped (near miss)
  ridingOnBall: boolean;         // Riding on ball
  comments: string;              // Comments
  defenseRating: number;         // Defense rating 0-5
  driverSkill: number;           // Driver skill 0-5 (renamed from driverRating)
  speedRating: number;           // Speed rating 0-5
  subjectiveNotes: string;       // Subjective notes

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
  alliance: 'Red',
  teamNumber: '',

  // Auto
  autoPath: [],
  autoFuel: 0,
  autoClimbStatus: AutoClimbStatus.None,
  autoClimbTime: 0,

  // Teleop
  teleFuel: 0,
  teleClimbStatus: TeleClimbStatus.None,
  teleClimbTime: 0,
  bumpTrenchCount: 0,
  fuelDroppedOnBump: false,

  // Penalty
  penaltyCount: 0,
  yellowCard: false,
  redCard: false,

  // PostMatch
  robotDied: false,
  almostTipped: false,
  ridingOnBall: false,
  comments: '',
  defenseRating: 0,
  driverSkill: 0,
  speedRating: 0,
  subjectiveNotes: '',

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
