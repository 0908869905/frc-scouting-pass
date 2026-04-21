
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
export type ClimbPosition = 'None' | 'LeftSide' | 'Left' | 'Center' | 'Right' | 'RightSide';

// Rating for subjective action assessment
export type ChecklistRating = '' | 'good' | 'ok' | 'bad';

// PostMatch structured checklist - drives the UI; serialized into ScoutingData.comments
export interface PostMatchChecklist {
  // 機器異常 - multi-select keys (see ISSUE_KEYS in utils/checklistSerializer.ts)
  issues: string[];

  // 機器表現 flags - multi-select keys (see FLAG_KEYS in utils/checklistSerializer.ts)
  flags: string[];

  // 有過劇烈撞擊
  hasCollision: boolean;
  collisionField: boolean;
  collisionRobot: boolean;
  collisionTeamNumbers: string;

  // 動作評分
  ratings: {
    pushTrench:    ChecklistRating;
    pushBump:      ChecklistRating;
    shoot:         ChecklistRating;  // 射回 Alliance Zone
    human:         ChecklistRating;
    defense:       ChecklistRating;
    intakeFuel:    ChecklistRating;
    transportFuel: ChecklistRating;
    shootFuel:     ChecklistRating;
  };

  // 自由輸入備註
  extraComments?: string;
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
  autoClimbStatus: AutoClimbStatus; // Level1/Failed/None
  autoClimbTime: number;         // Seconds to climb
  autoClimbPosition: ClimbPosition; // 5 positions

  // --- Teleop (2:20) ---
  teleClimbStatus: TeleClimbStatus; // Level1-3/Failed/None
  teleClimbTime: number;         // Seconds to climb
  teleClimbPosition: ClimbPosition; // 5 positions
  bumpCount: number;             // Times crossed Bump
  trenchCount: number;           // Times crossed Trench
  fuelDroppedOnBumpCount: number; // Times dropped fuel on Bump crossing

  // --- Penalty (within Teleop) ---
  minorPenalty: number;          // Minor penalty count
  majorPenalty: number;          // Major penalty count

  // --- PostMatch (Flat Fields, mirrored from postMatchChecklist) ---
  // PostMatch Issues (11)
  issueNoShow: boolean;
  issueCrashed: boolean;
  issueEStop: boolean;
  issueAStop: boolean;
  issueLowVoltage: boolean;
  issueIntakeStuck: boolean;
  issueShooterOff: boolean;
  issueStuckBump: boolean;
  issueHitTrench: boolean;
  issuePartFell: boolean;
  issueMovement: boolean;
  // PostMatch Flags (6)
  flagYellowCard: boolean;
  flagRedCard: boolean;
  flagBelowExpected: boolean;
  flagTipped: boolean;
  flagRidingFuel: boolean;
  flagStuckBall: boolean;
  // PostMatch Collision
  hasCollision: boolean;
  collisionField: boolean;
  collisionRobot: boolean;
  collisionTeamNumbers: string;
  // PostMatch Ratings (8)
  ratingPushTrench: ChecklistRating;
  ratingPushBump: ChecklistRating;
  ratingShoot: ChecklistRating;  // 射回 Alliance Zone
  ratingHuman: ChecklistRating;
  ratingDefense: ChecklistRating;
  ratingIntakeFuel: ChecklistRating;
  ratingTransportFuel: ChecklistRating;
  ratingShootFuel: ChecklistRating;
  // PostMatch free-text (mirrors postMatchChecklist.extraComments)
  comments: string;
  postMatchChecklist?: PostMatchChecklist; // UI single source of truth; flat fields derived from it

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
  eventCode: '2026CMPTX',
  matchLevel: MatchLevel.Quals,
  matchNumber: 1,
  alliance: 'R1',
  teamNumber: '',

  // Auto
  autoPath: [],
  autoClimbStatus: AutoClimbStatus.None,
  autoClimbTime: 0,
  autoClimbPosition: 'None',

  // Teleop
  teleClimbStatus: TeleClimbStatus.None,
  teleClimbTime: 0,
  teleClimbPosition: 'None',
  bumpCount: 0,
  trenchCount: 0,
  fuelDroppedOnBumpCount: 0,

  // Penalty (within Teleop)
  minorPenalty: 0,
  majorPenalty: 0,

  // PostMatch Issues (all false by default)
  issueNoShow: false,
  issueCrashed: false,
  issueEStop: false,
  issueAStop: false,
  issueLowVoltage: false,
  issueIntakeStuck: false,
  issueShooterOff: false,
  issueStuckBump: false,
  issueHitTrench: false,
  issuePartFell: false,
  issueMovement: false,
  // PostMatch Flags (all false by default)
  flagYellowCard: false,
  flagRedCard: false,
  flagBelowExpected: false,
  flagTipped: false,
  flagRidingFuel: false,
  flagStuckBall: false,
  // PostMatch Collision
  hasCollision: false,
  collisionField: false,
  collisionRobot: false,
  collisionTeamNumbers: '',
  // PostMatch Ratings
  ratingPushTrench: '',
  ratingPushBump: '',
  ratingShoot: '',
  ratingHuman: '',
  ratingDefense: '',
  ratingIntakeFuel: '',
  ratingTransportFuel: '',
  ratingShootFuel: '',
  // PostMatch free-text
  comments: '',
  postMatchChecklist: {
    issues: [],
    flags: [],
    hasCollision: false,
    collisionField: false,
    collisionRobot: false,
    collisionTeamNumbers: '',
    ratings: {
      pushTrench: '',
      pushBump: '',
      shoot: '',
      human: '',
      defense: '',
      intakeFuel: '',
      transportFuel: '',
      shootFuel: '',
    },
  },

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
