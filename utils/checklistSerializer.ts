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
] as const;

export const RATING_VALUES: Exclude<ChecklistRating, ''>[] = ['good', 'ok', 'bad'];

export type IssueKey  = typeof ISSUE_KEYS[number];
export type FlagKey   = typeof FLAG_KEYS[number];
export type RatingRow = typeof RATING_ROW_KEYS[number];

// -----------------------------------------------------------------------------
// Serializers
// Produce separate human-readable strings for the three spreadsheet columns:
// robotIssues (機器異常), performance (機器表現 = flags + collision + ratings),
// and comments (free-text extraComments only).
// -----------------------------------------------------------------------------

type TFunc = (key: string) => string;

export function serializeIssues(c: PostMatchChecklist, t: TFunc): string {
  if (c.issues.length === 0) return '';
  return c.issues.map(k => t(`issue_${k}`)).join(', ');
}

export function serializePerformance(c: PostMatchChecklist, t: TFunc): string {
  const parts: string[] = [];

  if (c.flags.length > 0) {
    parts.push(c.flags.map(k => t(`flag_${k}`)).join(', '));
  }

  if (c.hasCollision) {
    const coll: string[] = [];
    if (c.collisionField) coll.push(t('collision_field'));
    if (c.collisionRobot) {
      const teams = c.collisionTeamNumbers.trim();
      coll.push(teams ? `${t('collision_robot')}(${teams})` : t('collision_robot'));
    }
    if (coll.length > 0) {
      parts.push(`[${t('collision_toggle')}] ${coll.join(', ')}`);
    }
  }

  const labelRating = (k: RatingRow): string | null => {
    const v = c.ratings[k];
    if (v === '') return null;
    return `${t(`rating_${k}`)}:${t(`rating_${v}`)}`;
  };

  const ratings = (RATING_ROW_KEYS as readonly RatingRow[])
    .map(labelRating)
    .filter((s): s is string => s !== null);
  if (ratings.length > 0) parts.push(ratings.join(' | '));

  return parts.join(' | ');
}

export function serializeComments(c: PostMatchChecklist): string {
  return (c.extraComments ?? '').trim();
}

// -----------------------------------------------------------------------------
// Toggle helper (used by UI)
// -----------------------------------------------------------------------------

export function toggleInArray<T extends string>(arr: T[], key: T): T[] {
  return arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key];
}
