# PostMatch 44-Column Flat Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Phase 40's 3 aggregated text columns (`robotIssues` / `performance` / `comments`) with 44 flat columns — every issue/flag/collision boolean gets its own 0/1 column, every rating gets its own text column — to make Google Sheets `COUNTIF`-based analysis trivial.

**Architecture:** Keep `postMatchChecklist: PostMatchChecklist` as the single UI state. On every checklist change, `PostMatchTab.updateChecklist` calls the new `checklistToFlatFields()` helper which returns a `Partial<ScoutingData>` containing 26 freshly-derived flat fields; these are written in the same `update()` call as the checklist itself. `TSV_SCHEMA_MATCH` grows from 23 → 44 columns; the first 17 columns (PreMatch/Auto/Teleop/Penalty/Climb) are unchanged so existing sheet data lines up. Three dead fields (`robotDied`, `almostTipped`, `ridingOnBall`) that have been permanently `false` since Phase 39 are removed. `googleSheets.ts` gets a `PRESERVE_EMPTY_KEYS` set so rating/comments/collisionTeamNumbers output `''` instead of `'None'` when empty.

**Tech Stack:** React 18 + TypeScript 5.2 + Vite 5. **No test framework installed** — verification is `npm run build` (TypeScript compile) + manual browser end-to-end test per the 驗證清單 at the bottom of the spec.

**Spec:** `FRC/docs/superpowers/specs/2026-04-21-postmatch-flat-fields-design.md`

**Working directory:** all relative paths below are rooted at the FRC subproject `D:\FRC\frc-6998-scouting-pass\FRC\`. Run all `npm` / `git` commands from that directory.

**Commit strategy:** The schema is tightly coupled across 6 files — any intermediate state has TypeScript errors. Therefore Tasks 1-7 are a single logical change; we build & commit only once, at the end (Task 9). Do **not** commit in between tasks.

---

## File Structure

| File | Responsibility after this change |
|------|---------------------------------|
| `FRC/constants.ts` | TSV schema definitions — extended to 44-column `TSV_SCHEMA_MATCH` |
| `FRC/types.ts` | Core data types — `ScoutingData` loses 5 legacy fields, gains 26 flat fields; `INITIAL_DATA` mirrors it; `PostMatchChecklist` untouched |
| `FRC/utils/checklistSerializer.ts` | Canonical key lists (unchanged) + new `checklistToFlatFields()` that maps `PostMatchChecklist` → `Partial<ScoutingData>` with 26 flat values |
| `FRC/components/TabViews.tsx` | `PostMatchTab.updateChecklist` switches from 3 `serialize*()` calls to single `checklistToFlatFields()` spread |
| `FRC/components/HistoryEditForm.tsx` | Removes 3 legacy Toggle inputs (robotDied / almostTipped / ridingOnBall) that reference deleted fields |
| `FRC/contexts/LanguageContext.tsx` | Removes 3 now-unreferenced i18n keys (`robotDied`, `almostTipped`, `ridingOnBall`) from both EN and ZH tables |
| `FRC/services/googleSheets.ts` | Simplified `formatTextField` (returns `''` instead of `'None'` for blanks) + new `PRESERVE_EMPTY_KEYS` set applied in both `generateTSV` and `uploadToGoogleSheets` |

**Out-of-repo (not covered by this plan; flagged as a follow-up in Task 10):**
- scanner repo `Code.gs` — header array 23 → 44, then manual GET `?action=fixHeaders`

---

## Task 1: Expand `TSV_SCHEMA_MATCH` to 44 columns

**Files:**
- Modify: `FRC/constants.ts` lines 34-48

- [ ] **Step 1.1: Replace the schema array**

Open `FRC/constants.ts`. Replace lines 34-48 (the entire `TSV_SCHEMA_MATCH` export) with:

```ts
// TSV column order for Match scouting - MUST match ScoutingData keys
// Note: autoPath is excluded - it goes in a separate QR code
// v1.6.0 (2026-04-21): 23 → 44 columns. First 17 unchanged; post 27 flattened
// (11 issue + 6 flag + 3 collision bool + 1 collision text + 5 rating + 1 comments).
// Removed legacy: robotDied / almostTipped / ridingOnBall / robotIssues / performance.
export const TSV_SCHEMA_MATCH = [
  // PreMatch (6)
  'scouterName', 'eventCode', 'matchLevel', 'matchNumber', 'alliance', 'teamNumber',
  // Auto (3)
  'autoClimbStatus', 'autoClimbTime', 'autoClimbPosition',
  // Teleop (3)
  'bumpCount', 'trenchCount', 'fuelDroppedOnBumpCount',
  // Penalty (2)
  'minorPenalty', 'majorPenalty',
  // Climb (3)
  'teleClimbStatus', 'teleClimbTime', 'teleClimbPosition',
  // --- 17 above unchanged ---
  // PostMatch Issues (11) — 0/1
  'issueNoShow', 'issueCrashed', 'issueEStop', 'issueAStop', 'issueLowVoltage',
  'issueIntakeStuck', 'issueShooterOff', 'issueStuckBump', 'issueHitTrench',
  'issuePartFell', 'issueMovement',
  // PostMatch Flags (6) — 0/1
  'flagYellowCard', 'flagRedCard', 'flagBelowExpected', 'flagTipped',
  'flagRidingFuel', 'flagStuckBall',
  // PostMatch Collision (3 bool + 1 text)
  'hasCollision', 'collisionField', 'collisionRobot', 'collisionTeamNumbers',
  // PostMatch Ratings (5) — good/ok/bad or empty
  'ratingPushTrench', 'ratingPushBump', 'ratingShoot', 'ratingHuman', 'ratingDefense',
  // PostMatch free-text (1)
  'comments',
];
```

**Sanity check:** count the strings after the `--- 17 above unchanged ---` marker. Must be exactly 27 (11 + 6 + 4 + 5 + 1). Total array length 44.

- [ ] **Step 1.2: Do NOT run build yet**

`npm run build` will fail until Task 2 updates `types.ts` (the schema now references keys that don't exist in `ScoutingData`). Continue to Task 2.

---

## Task 2: Update `ScoutingData` type + `INITIAL_DATA`

**Files:**
- Modify: `FRC/types.ts` lines 105-112 (`ScoutingData` PostMatch section) and 162-168 (`INITIAL_DATA` PostMatch section)

- [ ] **Step 2.1: Replace the PostMatch section of `ScoutingData`**

In `FRC/types.ts`, find the `// --- PostMatch (Other + Subjective) ---` section (currently lines 105-112). Replace lines 106-111 (the 6 legacy field declarations — `robotDied` / `almostTipped` / `ridingOnBall` / `robotIssues` / `performance` / `comments`) with:

```ts
  // PostMatch Issues (11) - mirrored from postMatchChecklist.issues[]
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
  // PostMatch Flags (6) - mirrored from postMatchChecklist.flags[]
  flagYellowCard: boolean;
  flagRedCard: boolean;
  flagBelowExpected: boolean;
  flagTipped: boolean;
  flagRidingFuel: boolean;
  flagStuckBall: boolean;
  // PostMatch Collision - mirrored from postMatchChecklist
  hasCollision: boolean;
  collisionField: boolean;
  collisionRobot: boolean;
  collisionTeamNumbers: string;
  // PostMatch Ratings (5) - mirrored from postMatchChecklist.ratings
  ratingPushTrench: ChecklistRating;
  ratingPushBump: ChecklistRating;
  ratingShoot: ChecklistRating;
  ratingHuman: ChecklistRating;
  ratingDefense: ChecklistRating;
  // PostMatch free-text - mirrors postMatchChecklist.extraComments
  comments: string;
```

Keep the `postMatchChecklist?: PostMatchChecklist;` line (currently line 112) — it remains the UI's single source of truth.

- [ ] **Step 2.2: Replace the PostMatch section of `INITIAL_DATA`**

Find the `// PostMatch` block in `INITIAL_DATA` (currently lines 162-168). Replace lines 163-168 (the 6 legacy `robotDied: false, ... comments: ''` lines) with:

```ts
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
  // PostMatch free-text
  comments: '',
```

The `postMatchChecklist: { ... }` object immediately below (currently lines 169-183) stays unchanged.

- [ ] **Step 2.3: Do NOT run build yet**

`TabViews.tsx`, `checklistSerializer.ts`, `googleSheets.ts`, `HistoryEditForm.tsx` still reference deleted fields. Continue to Task 3.

---

## Task 3: Rewrite `checklistSerializer.ts`

**Files:**
- Modify: `FRC/utils/checklistSerializer.ts` lines 45-94 (replace the three old `serialize*()` functions)

- [ ] **Step 3.1: Replace the Serializers section**

Open `FRC/utils/checklistSerializer.ts`. The top of the file (lines 1-43: type aliases, `ISSUE_KEYS`, `FLAG_KEYS`, `RATING_ROW_KEYS`, `RATING_VALUES`, exported types) **stays unchanged** — those constants are still consumed by the UI.

Replace lines 45-94 (from the `// Serializers` banner down to and including `serializeComments()`) with:

```ts
// -----------------------------------------------------------------------------
// Flat-field derivation
// Maps the UI's PostMatchChecklist into a Partial<ScoutingData> containing the
// 26 flat PostMatch fields. Written on every checklist mutation so TSV export
// can read them directly without re-serializing.
// -----------------------------------------------------------------------------

import type { ScoutingData } from '../types';

// Map of UI issue key -> ScoutingData field name (both sets kept in sync manually).
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
  pushTrench: 'ratingPushTrench',
  pushBump:   'ratingPushBump',
  shoot:      'ratingShoot',
  human:      'ratingHuman',
  defense:    'ratingDefense',
};

export function checklistToFlatFields(c: PostMatchChecklist): Partial<ScoutingData> {
  const out: Partial<ScoutingData> = {};

  // Issues: true iff the key is present in c.issues[]
  const issueSet = new Set(c.issues);
  (ISSUE_KEYS as readonly IssueKey[]).forEach(k => {
    (out as Record<string, unknown>)[ISSUE_FIELD_MAP[k]] = issueSet.has(k);
  });

  // Flags: true iff the key is present in c.flags[]
  const flagSet = new Set(c.flags);
  (FLAG_KEYS as readonly FlagKey[]).forEach(k => {
    (out as Record<string, unknown>)[FLAG_FIELD_MAP[k]] = flagSet.has(k);
  });

  // Collision: bool + bool + bool + text
  out.hasCollision         = c.hasCollision;
  out.collisionField       = c.hasCollision && c.collisionField;
  out.collisionRobot       = c.hasCollision && c.collisionRobot;
  out.collisionTeamNumbers = c.hasCollision ? (c.collisionTeamNumbers ?? '').trim() : '';

  // Ratings: enum text ('' | 'good' | 'ok' | 'bad')
  (RATING_ROW_KEYS as readonly RatingRow[]).forEach(row => {
    (out as Record<string, unknown>)[RATING_FIELD_MAP[row]] = c.ratings[row];
  });

  // Free-text comments: trimmed extraComments
  out.comments = (c.extraComments ?? '').trim();

  return out;
}

// -----------------------------------------------------------------------------
// Toggle helper (used by UI)
// -----------------------------------------------------------------------------
```

(The `toggleInArray()` definition at the end of the file is kept; only the three serializer exports are removed.)

**Rationale on the collision clamping (`c.hasCollision && c.collisionField`):** when a user toggles collision off after having ticked Field/Robot, the sub-fields should not leak out as `1` to TSV. Gating them by `hasCollision` keeps the output consistent with what the UI shows.

- [ ] **Step 3.2: Verify the file structure**

The file should now have three logical sections:
1. **Canonical keys** (lines 1-43, unchanged): `ISSUE_KEYS`, `FLAG_KEYS`, `RATING_ROW_KEYS`, `RATING_VALUES`, exported types
2. **Flat-field derivation** (new): `ISSUE_FIELD_MAP`, `FLAG_FIELD_MAP`, `RATING_FIELD_MAP`, `checklistToFlatFields()`
3. **Toggle helper**: `toggleInArray()`

- [ ] **Step 3.3: Do NOT run build yet**

Continue to Task 4 — `TabViews.tsx` still imports the deleted `serialize*()` functions.

---

## Task 4: Update `PostMatchTab.updateChecklist`

**Files:**
- Modify: `FRC/components/TabViews.tsx` lines 13-24 (imports) and 730-739 (`updateChecklist` body)

- [ ] **Step 4.1: Fix the checklistSerializer import**

Find the import block at lines 13-24. It currently includes:

```ts
import {
  serializeIssues,
  serializePerformance,
  serializeComments,
  ...
} from '../utils/checklistSerializer';
```

Replace the three deleted names with `checklistToFlatFields`. The final import should read:

```ts
import {
  checklistToFlatFields,
  ISSUE_KEYS,
  FLAG_KEYS,
  RATING_ROW_KEYS,
  RATING_VALUES,
  toggleInArray,
  type IssueKey,
  type FlagKey,
  type RatingRow,
} from '../utils/checklistSerializer';
```

(Preserve whatever exact subset of the above TabViews actually imports — only swap the three `serialize*` names for `checklistToFlatFields`.)

- [ ] **Step 4.2: Rewrite `updateChecklist`**

Find the current body (lines 730-739):

```ts
  const updateChecklist = (patch: Partial<PostMatchChecklist>) => {
    const next: PostMatchChecklist = { ...checklist, ...patch };
    const T = t as (k: string) => string;
    update({
      postMatchChecklist: next,
      robotIssues: serializeIssues(next, T),
      performance: serializePerformance(next, T),
      comments: serializeComments(next),
    });
  };
```

Replace with:

```ts
  const updateChecklist = (patch: Partial<PostMatchChecklist>) => {
    const next: PostMatchChecklist = { ...checklist, ...patch };
    update({
      postMatchChecklist: next,
      ...checklistToFlatFields(next),
    });
  };
```

(The `const T = t as ...` line goes away — flat fields are language-independent booleans/enums.)

**Nothing else in `PostMatchTab` needs to change.** The chip toggles, rating segmented controls, collision toggle, and extraComments textarea all already drive `updateChecklist(...)`, so they now implicitly write flat fields.

- [ ] **Step 4.3: Do NOT run build yet**

Continue to Task 5 — `HistoryEditForm.tsx` still references deleted fields.

---

## Task 5: Remove legacy Toggles from `HistoryEditForm.tsx`

**Files:**
- Modify: `FRC/components/HistoryEditForm.tsx` lines 167-196

- [ ] **Step 5.1: Delete the PostMatch Flags block**

In `FRC/components/HistoryEditForm.tsx`, delete lines 167-196 in their entirety — the `{/* PostMatch Flags */}` block containing the three `<label>` checkboxes for `robotDied` / `almostTipped` / `ridingOnBall`.

After deletion, the file should jump from the end of the Penalty grid directly to the `{/* Comments */}` block at what was line 198.

**Do not add replacement UI** — per spec, HistoryEditForm does not need to surface the new flat fields (users re-edit via PostMatchTab if they want fine-grained editing; HistoryEditForm's scope is the basic text/number fields).

- [ ] **Step 5.2: Do NOT run build yet**

Continue to Task 6 — i18n keys are still orphaned.

---

## Task 6: Clean up now-orphaned i18n keys in `LanguageContext.tsx`

**Files:**
- Modify: `FRC/contexts/LanguageContext.tsx` lines 47-49 (EN) and 238-240 (ZH)

- [ ] **Step 6.1: Delete the EN keys**

In `FRC/contexts/LanguageContext.tsx`, delete lines 47-49:

```ts
    robotDied: "Robot Died/Disabled",
    almostTipped: "Almost Tipped",
    ridingOnBall: "Riding on Fuel",
```

- [ ] **Step 6.2: Delete the ZH keys**

Delete lines 238-240:

```ts
    robotDied: "機器人死亡/失效",
    almostTipped: "差點翻車",
    ridingOnBall: "騎在 Fuel 上",
```

**Keep** `performanceHeader` (line 55 EN, 246 ZH) — it's still used as the section header inside PostMatchTab.

**Keep** all `issue_<key>` / `flag_<key>` / `rating_<key>` / `collision_*` keys — the UI still renders these labels inside the checklist chips.

- [ ] **Step 6.3: Do NOT run build yet**

Continue to Task 7 — `googleSheets.ts` still references deleted fields.

---

## Task 7: Update `googleSheets.ts` TSV + upload logic

**Files:**
- Modify: `FRC/services/googleSheets.ts` lines 68-73 (formatTextField), 95-136 (generateTSV), 138-200 (uploadToGoogleSheets)

- [ ] **Step 7.1: Simplify `formatTextField` and add `PRESERVE_EMPTY_KEYS`**

Replace lines 68-73 (`formatTextField` helper):

```ts
// Helper to format free-text fields (robotIssues / performance / comments)
// Returns 'None' if empty; otherwise the trimmed text (Unicode preserved).
const formatTextField = (value: unknown): string => {
  const s = typeof value === 'string' ? value.trim() : '';
  return s !== '' ? s : 'None';
};
```

with:

```ts
// Trim a string value; returns '' for blank/non-string. Caller decides fallback.
const formatTextField = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

// TSV keys whose empty/blank value should output '' (not 'None').
// All other empty string/null/undefined values keep the legacy 'None' fallback
// so PreMatch fields (scouterName, teamNumber, etc.) still surface as 'None' when blank.
const PRESERVE_EMPTY_KEYS = new Set<string>([
  'comments',
  'collisionTeamNumbers',
  'ratingPushTrench',
  'ratingPushBump',
  'ratingShoot',
  'ratingHuman',
  'ratingDefense',
]);
```

- [ ] **Step 7.2: Update `generateTSV`**

Find the schema-row body (lines 98-135). The current code has a special case:

```ts
    if (key === 'comments' || key === 'robotIssues' || key === 'performance') {
        const raw = data[key as keyof ScoutingData];
        return formatTextField(raw).replace(/\t/g, ' ').replace(/\n/g, ' ');
    }
```

and a later empty-handling branch:

```ts
    if (val === undefined || val === null || String(val).trim() === '') {
        return 'None';
    }
```

Replace the `comments/robotIssues/performance` special case (the 4-line `if` block at line 100-103) with:

```ts
    if (key === 'comments') {
        return formatTextField(data.comments).replace(/\t/g, ' ').replace(/\n/g, ' ');
    }
```

And replace the later empty-handling branch (line 121-123) with:

```ts
    if (val === undefined || val === null || String(val).trim() === '') {
        return PRESERVE_EMPTY_KEYS.has(key) ? '' : 'None';
    }
```

Leave every other branch in `generateTSV` untouched (boolean → '1'/'0', arrays, abbreviations, default string). The new 17 boolean fields ride the existing boolean branch; the 5 rating text fields either return '' via `PRESERVE_EMPTY_KEYS` (when empty) or pass through the default string branch (when 'good'/'ok'/'bad'). `collisionTeamNumbers` behaves the same: empty → '', non-empty → passes through default string branch.

- [ ] **Step 7.3: Update `uploadToGoogleSheets` payload formatting**

Find lines 156-159 currently:

```ts
  // Format PostMatch text columns - safeJsonStringify handles Unicode escaping.
  payload.robotIssues = formatTextField(data.robotIssues);
  payload.performance = formatTextField(data.performance);
  payload.comments = formatTextField(data.comments);
```

Replace with:

```ts
  // PostMatch free-text: trim; PRESERVE_EMPTY_KEYS keeps it as '' below instead of 'None'.
  payload.comments = formatTextField(data.comments);
  payload.collisionTeamNumbers = formatTextField(data.collisionTeamNumbers);
```

Then find the trailing iteration loop (lines 165-181) which has:

```ts
    else if (val === undefined || val === null || String(val).trim() === '') {
        payload[key] = 'None';
    }
```

Replace that branch with:

```ts
    else if (val === undefined || val === null || String(val).trim() === '') {
        payload[key] = PRESERVE_EMPTY_KEYS.has(key) ? '' : 'None';
    }
```

Leave the boolean → 1/0 and array-join branches unchanged.

- [ ] **Step 7.4: Update the stale comment on `formatTextField`**

Find `robotIssues / performance / comments` inside code comments in `googleSheets.ts` and remove/update them — e.g. the file header comment about PostMatch text columns. One `sed`-safe pass: any comment mentioning `robotIssues` or `performance` referring to the TSV layer is now wrong; either delete the offending line or reword to mention `comments` + `collisionTeamNumbers` only. This is bookkeeping — skim the file top-to-bottom after Step 7.3 and adjust stale comments where found.

---

## Task 8: Build + manual verification

- [ ] **Step 8.1: TypeScript build**

Run from `D:\FRC\frc-6998-scouting-pass\FRC\`:

```bash
npm run build
```

**Expected:** exits 0 with no TypeScript errors, produces `dist/` output.

**If it fails:**
- `TS2551` / `TS2339` on `robotDied` / `almostTipped` / `ridingOnBall` / `robotIssues` / `performance` → some file still references a deleted field. `grep -rn "robotDied\|almostTipped\|ridingOnBall\|robotIssues\|performance" src/` to find it.
- Unresolved `serializeIssues` / `serializePerformance` / `serializeComments` → an import was missed in Task 4.
- Orphan `t('robotDied')` etc. → i18n lookup still in TabViews/HistoryEditForm. Replace with the closest current label or delete the stranded UI.

Fix and re-run `npm run build` until green. **Do not commit until build passes.**

- [ ] **Step 8.2: Manual browser verification (per spec 驗證清單)**

Run:

```bash
npm run dev
```

Open `http://localhost:5173` on a desktop browser. Walk the app through these checks (**all must pass**):

1. PostMatchTab renders without a console error; all 11 issue chips + 6 flag chips + 5 rating controls + collision toggle + extraComments textarea are clickable / editable.
2. Toggle 2 issue chips and 1 flag chip → open browser DevTools → `localStorage.getItem('frc_scouting_data')` → confirm the corresponding flat keys (e.g. `issueNoShow: true`) are written alongside `postMatchChecklist`.
3. Rating — pick `good` for one row, `bad` for another, leave the rest blank. Confirm the matching `ratingXxx` flat fields hold exactly `'good'`, `'bad'`, `''`.
4. Collision toggle ON → tick Field, type teams `1234, 5678` into Robot → untoggle collision entirely. Confirm `hasCollision`, `collisionField`, `collisionRobot` all become `false` and `collisionTeamNumbers` becomes `''` (the `hasCollision &&` clamp in `checklistToFlatFields`).
5. Navigate to QR Code tab → click "Match TSV" (or equivalent export). Confirm the TSV row has **exactly 44 tab-separated fields**. Easiest count: copy the row to a text editor, `split('\t')`, check length.
6. In the exported TSV, locate the `issueXxx` positions — ticked ones must be `1`, unticked must be `0`. Rating positions must be `good`/`ok`/`bad`/blank (not `None`). Collision text blank → blank. Comments blank → blank.
7. Open History tab → open any existing saved match created **before** this refactor → confirm the detail view renders without crashing (old records have no flat fields; they fallback to `false`/`''`).
8. Click "Edit" on an old history record → confirm the modal opens, shows text/number fields, and no longer has the 3 legacy checkboxes.

**Record any failures.** If step 7 or 8 crashes because an old record is missing a flat field, add defensive `??` fallbacks in the read path — but first check whether `INITIAL_DATA` merging at load time already shields us (usually it does in `services/storage.ts`). Prefer not to patch the read path if the defaults are already being applied.

- [ ] **Step 8.3: Lint / dead-import sweep**

```bash
npm run build 2>&1 | grep -iE "unused|noUnusedLocals|noUnusedParameters" || echo "clean"
```

If TS reports unused imports in `TabViews.tsx` or `googleSheets.ts`, remove them.

---

## Task 9: Commit

- [ ] **Step 9.1: Review the full diff**

```bash
git status
git diff
```

**Expected `git status`:** modified files should be exactly:
- `FRC/constants.ts`
- `FRC/types.ts`
- `FRC/utils/checklistSerializer.ts`
- `FRC/components/TabViews.tsx`
- `FRC/components/HistoryEditForm.tsx`
- `FRC/contexts/LanguageContext.tsx`
- `FRC/services/googleSheets.ts`

Plus **PROGRESS.md / CLAUDE.md / FINDINGS.md** if they've been updated during the session (these are meta-docs, commit them in a separate housekeeping commit or include in this one — user preference).

- [ ] **Step 9.2: Stage the code files**

```bash
git add FRC/constants.ts FRC/types.ts FRC/utils/checklistSerializer.ts FRC/components/TabViews.tsx FRC/components/HistoryEditForm.tsx FRC/contexts/LanguageContext.tsx FRC/services/googleSheets.ts
```

Avoid `git add -A` to prevent staging the untracked `nul` file / screenshot clutter already present in the working tree.

- [ ] **Step 9.3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(schema): flatten postmatch to 44 columns

Replace Phase 40's 3 aggregated text columns (robotIssues / performance /
comments) with 44 discrete flat columns so spreadsheet COUNTIF analysis is
trivial. First 17 columns (PreMatch/Auto/Teleop/Penalty/Climb) unchanged.

- TSV_SCHEMA_MATCH: 23 -> 44 columns
- Remove legacy fields robotDied / almostTipped / ridingOnBall (dead since
  Phase 39) plus robotIssues / performance (superseded)
- Add 11 issue bool + 6 flag bool + 3 collision bool + 1 collision text +
  5 rating text + 1 comments text to ScoutingData
- checklistSerializer: replace serializeIssues/Performance/Comments with
  single checklistToFlatFields() deriving all 26 values
- googleSheets: simplify formatTextField + introduce PRESERVE_EMPTY_KEYS so
  rating / collisionTeamNumbers / comments emit '' (not 'None') when blank
- HistoryEditForm: remove 3 legacy checkbox toggles
- LanguageContext: prune 6 orphaned i18n keys (robotDied/almostTipped/
  ridingOnBall EN + ZH)

Spec: FRC/docs/superpowers/specs/2026-04-21-postmatch-flat-fields-design.md
Plan: FRC/docs/superpowers/plans/2026-04-21-postmatch-flat-fields.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 9.4: Verify the commit**

```bash
git log --oneline -3
git status
```

Commit should be present at HEAD; working tree clean (or only meta-docs left, per Step 9.1).

---

## Task 10: Push + scanner-repo follow-up

- [ ] **Step 10.1: Push to origin**

```bash
git push origin main
```

Vercel will auto-deploy the frontend. **At this point production Sheets still have 23-column headers** — any new match uploaded from the deployed site will misalign until Step 10.2 is done. Warn the team to hold off on live scouting until 10.3.

- [ ] **Step 10.2: scanner repo — update `Code.gs` header array to 44 columns (OUT OF THIS REPO)**

This is a separate repository. In the scanner repo's `Code.gs`, find the header array used by the `fixHeaders` action and replace the PostMatch segment (currently 6 items: `robotDied`, `almostTipped`, `ridingOnBall`, `robotIssues`, `performance`, `comments`) with the 27 flat keys in the order defined in Task 1 Step 1.1. Deploy a new Apps Script version.

- [ ] **Step 10.3: Run `fixHeaders` once per active Sheet**

For each live Google Sheet backing a scouting event:

```
GET <googleScriptUrl>?action=fixHeaders
```

(Paste the URL into a browser tab.) Expected response: JSON confirming 44 headers written. Spot-check row 1 of the sheet to confirm the new order.

- [ ] **Step 10.4: End-to-end QR scan verification**

With a field scanner device: scout a practice match on the deployed site → render the Match QR → scan with the updated scanner → confirm a new row lands in the Sheet with all 44 cells populated in the correct columns. This is the final gate before clearing the team to scout live.

---

## Rollback plan

If Step 10.4 fails after deployment:

1. `git revert <commit-sha-from-Step-9.3>` → push → Vercel auto-deploys the old frontend.
2. Revert the scanner `Code.gs` change and re-run `?action=fixHeaders` — it will restore the 23-column layout.
3. Sheets may have a mix of 23- and 44-column rows if any uploads happened in-window; those can be cleaned up manually (new flat columns are empty on the pre-rollback rows either way).

The schema change is additive-after-column-17, so rollback is cheap.

---

*Plan status: ready for execution.*
