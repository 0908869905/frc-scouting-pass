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
// Serializer
// Produces a human-readable multi-line summary of the checklist
// Used to populate ScoutingData.comments for TSV/QR export
// -----------------------------------------------------------------------------

type TFunc = (key: string) => string;

export function serializeChecklist(c: PostMatchChecklist, t: TFunc): string {
  const lines: string[] = [];

  if (c.issues.length > 0) {
    const names = c.issues.map(k => t(`issue_${k}`)).join(', ');
    lines.push(`[${t('issuesHeader')}] ${names}`);
  }

  if (c.flags.length > 0) {
    const names = c.flags.map(k => t(`flag_${k}`)).join(', ');
    lines.push(`[${t('performanceHeader')}] ${names}`);
  }

  if (c.hasCollision) {
    const parts: string[] = [];
    if (c.collisionField) parts.push(t('collision_field'));
    if (c.collisionRobot) {
      const teams = c.collisionTeamNumbers.trim();
      parts.push(teams ? `${t('collision_robot')}(${teams})` : t('collision_robot'));
    }
    if (parts.length > 0) {
      lines.push(`[${t('collision_toggle')}] ${parts.join(', ')}`);
    }
  }

  const labelRating = (k: RatingRow): string | null => {
    const v = c.ratings[k];
    if (v === '') return null;
    return `[${t(`rating_${k}`)}] ${t(`rating_${v}`)}`;
  };

  const pushLine = [labelRating('pushTrench'), labelRating('pushBump')]
    .filter((s): s is string => s !== null)
    .join(' | ');
  if (pushLine) lines.push(pushLine);

  const otherLine = [labelRating('shoot'), labelRating('human'), labelRating('defense')]
    .filter((s): s is string => s !== null)
    .join(' | ');
  if (otherLine) lines.push(otherLine);

  const extra = (c.extraComments ?? '').trim();
  if (extra) lines.push(extra);

  return lines.join('\n');
}

// -----------------------------------------------------------------------------
// Toggle helper (used by UI)
// -----------------------------------------------------------------------------

export function toggleInArray<T extends string>(arr: T[], key: T): T[] {
  return arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key];
}
