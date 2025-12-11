
export type MatchPhase = 
  | 'PreMatch' | 'Auton' | 'Teleop' | 'PostMatch' 
  | 'PitInfo' | 'PitRobot' | 'PitSpecs' // Pit phases
  | 'QRCode';

export type ScoutingMode = 'Match' | 'Pit';

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
  DeepCage = 'Deep Cage',
  ShallowCage = 'Shallow Cage',
  FailedDeep = 'Failed Deep',
  FailedShallow = 'Failed Shallow'
}

export enum PickupSource {
  Source = 'Coral Station',
  Floor = 'Floor',
  Both = 'Both',
  None = 'Not Attempted'
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
  humanPlayerPresent: boolean;

  // Auton
  autoLeave: boolean;
  autoCoralL1Success: number;
  autoCoralL1Fail: number;
  autoCoralL2Success: number;
  autoCoralL2Fail: number;
  autoCoralL3Success: number;
  autoCoralL3Fail: number;
  autoCoralL4Success: number;
  autoCoralL4Fail: number;
  autoProcessorSuccess: number;
  autoProcessorFail: number;
  autoNetSuccess: number;
  autoNetFail: number;

  // Teleop
  teleCoralL1Success: number;
  teleCoralL1Fail: number;
  teleCoralL2Success: number;
  teleCoralL2Fail: number;
  teleCoralL3Success: number;
  teleCoralL3Fail: number;
  teleCoralL4Success: number;
  teleCoralL4Fail: number;
  teleProcessorSuccess: number;
  teleProcessorFail: number;
  teleNetSuccess: number;
  teleNetFail: number;
  
  telePickupSource: PickupSource;
  teleOpponentProcessor: boolean;
  teleBargeTime: number; // Seconds
  teleEndGame: EndGameStatus;

  // Post Match
  defenseRating: number; // 0-5
  driverRating: number; // 0-5
  speedRating: number; // 0-5
  defendedBy: string;
  coopBonus: boolean;
  algaeRemaning: number;
  robotDied: boolean;
  tippedOver: boolean;
  droppedCoral: boolean;
  droppedAlgae: boolean;
  comments: string;
  tags: string[]; // Strategy Tags

  // --- Pit Scouting Fields ---
  pitDriveTrain: string;
  pitMotorType: string;
  pitLength: number; // inches or cm
  pitWidth: number;
  pitWeight: number; // lbs or kg
  pitCanCoralL1: boolean;
  pitCanCoralL2: boolean;
  pitCanCoralL3: boolean;
  pitCanCoralL4: boolean;
  pitCanAlgaeProcessor: boolean;
  pitCanAlgaeNet: boolean;
  pitCanDeepCage: boolean;
  pitCanShallowCage: boolean;
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
  humanPlayerPresent: false,

  autoLeave: false,
  autoCoralL1Success: 0,
  autoCoralL1Fail: 0,
  autoCoralL2Success: 0,
  autoCoralL2Fail: 0,
  autoCoralL3Success: 0,
  autoCoralL3Fail: 0,
  autoCoralL4Success: 0,
  autoCoralL4Fail: 0,
  autoProcessorSuccess: 0,
  autoProcessorFail: 0,
  autoNetSuccess: 0,
  autoNetFail: 0,

  teleCoralL1Success: 0,
  teleCoralL1Fail: 0,
  teleCoralL2Success: 0,
  teleCoralL2Fail: 0,
  teleCoralL3Success: 0,
  teleCoralL3Fail: 0,
  teleCoralL4Success: 0,
  teleCoralL4Fail: 0,
  teleProcessorSuccess: 0,
  teleProcessorFail: 0,
  teleNetSuccess: 0,
  teleNetFail: 0,

  telePickupSource: PickupSource.None,
  teleOpponentProcessor: false,
  teleBargeTime: 0,
  teleEndGame: EndGameStatus.None,

  defenseRating: 0,
  driverRating: 0,
  speedRating: 0,
  defendedBy: '',
  coopBonus: false,
  algaeRemaning: 0,
  robotDied: false,
  tippedOver: false,
  droppedCoral: false,
  droppedAlgae: false,
  comments: '',
  tags: [],

  // Pit defaults
  pitDriveTrain: 'Swerve',
  pitMotorType: 'Kraken',
  pitLength: 0,
  pitWidth: 0,
  pitWeight: 0,
  pitCanCoralL1: false,
  pitCanCoralL2: false,
  pitCanCoralL3: false,
  pitCanCoralL4: false,
  pitCanAlgaeProcessor: false,
  pitCanAlgaeNet: false,
  pitCanDeepCage: false,
  pitCanShallowCage: false,
  pitAutoNotes: ''
};
