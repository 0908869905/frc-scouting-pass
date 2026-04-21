import type { PostMatchChecklist, ChecklistRating } from '../types';

// -----------------------------------------------------------------------------
// Canonical keys - shared between UI and serializer
// Each key has a matching i18n translation (issue_<key>, flag_<key>, rating_<key>)
// -----------------------------------------------------------------------------

export const ISSUE_KEYS = [
  'noShow',
  'crashed',
  'eStop',
  'aStop',
  'lowVoltage',
  'intakeStuck',
  'shooterOff',
  'stuckBump',
  'hitTrench',
  'partFell',
  'movement',
] as const;

export const FLAG_KEYS = [
  'yellowCard',
  'redCard',
  'belowExpected',
  'tipped',
  'ridingFuel',
  'stuckBall',
] as const;

export const RATING_ROW_KEYS = [
  'pushTrench',
  'pushBump',
  'shoot',
  'human',
  'defense',
  'intakeFuel',
  'transportFuel',
  'shootFuel',
] as const;

export const RATING_VALUES: Exclude<ChecklistRating, ''>[] = ['good', 'ok', 'bad'];

export type IssueKey  = typeof ISSUE_KEYS[number];
export type FlagKey   = typeof FLAG_KEYS[number];
export type RatingRow = typeof RATING_ROW_KEYS[number];

// -----------------------------------------------------------------------------
// Flat-field derivation
// Maps the UI's PostMatchChecklist into a Partial<ScoutingData> containing the
// 26 flat PostMatch fields. Written on every checklist mutation so TSV export
// can read them directly without re-serializing.
// -----------------------------------------------------------------------------

import type { ScoutingData } from '../types';

const ISSUE_FIELD_MAP: Record<IssueKey, keyof ScoutingData> = {
  noShow:       'issueNoShow',
  crashed:      'issueCrashed',
  eStop:        'issueEStop',
  aStop:        'issueAStop',
  lowVoltage:   'issueLowVoltage',
  intakeStuck:  'issueIntakeStuck',
  shooterOff:   'issueShooterOff',
  stuckBump:    'issueStuckBump',
  hitTrench:    'issueHitTrench',
  partFell:     'issuePartFell',
  movement:     'issueMovement',
};

const FLAG_FIELD_MAP: Record<FlagKey, keyof ScoutingData> = {
  yellowCard:    'flagYellowCard',
  redCard:       'flagRedCard',
  belowExpected: 'flagBelowExpected',
  tipped:        'flagTipped',
  ridingFuel:    'flagRidingFuel',
  stuckBall:     'flagStuckBall',
};

const RATING_FIELD_MAP: Record<RatingRow, keyof ScoutingData> = {
  pushTrench:    'ratingPushTrench',
  pushBump:      'ratingPushBump',
  shoot:         'ratingShoot',
  human:         'ratingHuman',
  defense:       'ratingDefense',
  intakeFuel:    'ratingIntakeFuel',
  transportFuel: 'ratingTransportFuel',
  shootFuel:     'ratingShootFuel',
};

// hasCollision clamp: when collision toggle is off, sub-fields do not leak to TSV.
export function checklistToFlatFields(c: PostMatchChecklist): Partial<ScoutingData> {
  const out: Partial<ScoutingData> = {};

  const issueSet = new Set(c.issues);
  (ISSUE_KEYS as readonly IssueKey[]).forEach(k => {
    (out as Record<string, unknown>)[ISSUE_FIELD_MAP[k]] = issueSet.has(k);
  });

  const flagSet = new Set(c.flags);
  (FLAG_KEYS as readonly FlagKey[]).forEach(k => {
    (out as Record<string, unknown>)[FLAG_FIELD_MAP[k]] = flagSet.has(k);
  });

  out.hasCollision         = c.hasCollision;
  out.collisionField       = c.hasCollision && c.collisionField;
  out.collisionRobot       = c.hasCollision && c.collisionRobot;
  out.collisionTeamNumbers = c.hasCollision ? (c.collisionTeamNumbers ?? '').trim() : '';

  (RATING_ROW_KEYS as readonly RatingRow[]).forEach(row => {
    (out as Record<string, unknown>)[RATING_FIELD_MAP[row]] = c.ratings[row];
  });

  out.comments = (c.extraComments ?? '').trim();

  return out;
}

// -----------------------------------------------------------------------------
// Toggle helper (used by UI)
// -----------------------------------------------------------------------------

export function toggleInArray<T extends string>(arr: T[], key: T): T[] {
  return arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key];
}
