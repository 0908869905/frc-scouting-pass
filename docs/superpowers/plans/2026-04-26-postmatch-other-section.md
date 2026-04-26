# PostMatch「其他」區段 + Teleop 三欄移除 Implementation Plan (v1.9.0)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 升級 schema 從 v1.8.0 (48 欄) → v1.9.0 (48 欄但結構大改)：移除 Teleop 3 個計數欄、新增 PostMatch「其他」區段 (1 boolean + 2 rating)、改名 `flag_stuckBall` i18n label。

**Architecture:** 主 repo 改完 → 程式化驗證 → 同步 scanner repo 三處鏡像 + i18n → 程式化驗證 → 兩 repo build/commit/push → 使用者外部部署 GAS + fixHeaders + 端對端 QR 驗證。

**Tech Stack:** TypeScript / React / Vite / Google Apps Script。`npm run build` 為主要驗證命令（無單元測試框架）。

**Repos:**
- 主 repo: `D:\FRC\frc-6998-scouting-pass\FRC\` (branch: `main`)
- Scanner repo: `D:\FRC\frc-scout-scanner\` (branch: `main`)

**Spec:** `docs/superpowers/specs/2026-04-26-postmatch-other-section-design.md`

---

## File Structure

### 主 repo 改動 (8 檔)

| 檔案 | 動作 |
|------|------|
| `constants.ts` | TSV_SCHEMA_MATCH 移 3 加 3 + 檔頭 v1.9.0 註解 |
| `types.ts` | ScoutingData 移 3 加 3、INITIAL_DATA 同步、PostMatchChecklist + 3 新欄位 |
| `utils/checklistSerializer.ts` | 拆 RATING_ROW_KEYS 為 MAIN/OTHER，加 stealsOpponent → otherStealsOpponent 處理 |
| `services/googleSheets.ts` | PRESERVE_EMPTY_KEYS 加 2 個新 rating |
| `contexts/LanguageContext.tsx` | 移 3 i18n + 改 flag_stuckBall label + 加 11 個新 keys |
| `components/TabViews.tsx` | Teleop 移 3 Counter + PostMatch 加「其他」可摺疊區段 |
| `components/HistoryEditForm.tsx` | 移 3 input field |
| `CLAUDE.md` | 文件更新 v1.9.0 |

### Scanner repo 改動 (5 檔)

| 檔案 | 動作 |
|------|------|
| `src/constants/schema.ts` | TSV_SCHEMA_MATCH 移 3 加 3 + FIELD_LABELS 移 3 加 3 + flag_stuckBall 改名 + 檔頭 v1.9.0 |
| `src/utils/decoder.ts` | 註解 v1.8.0 → v1.9.0（length 動態 logic 不需改） |
| `src/i18n/locales/en.ts` | fields 移 3 加 3 + flagStuckBall label "Stuck on fuel" |
| `src/i18n/locales/zh-TW.ts` | 同上 + 「卡在 fuel 上」 |
| `google-apps-script/Code.gs` | TSV_SCHEMA_MATCH 移 3 加 3 + version `'1.9.0'` + 編號註解 + 測試資料清整 |

---

## 執行階段

- **Stage A**：主 repo schema/型別/序列化 (Task 1-3)
- **Stage B**：主 repo i18n + UI (Task 4-7)
- **Stage C**：主 repo build + commit (Task 8)
- **Stage D**：Scanner repo schema 同步 (Task 9-11)
- **Stage E**：驗證 + commit (Task 12-13)
- **Stage F**：文件 + 部署提示 (Task 14)

---

## Stage A：主 repo schema/型別/序列化

### Task 1: 更新 `constants.ts` schema

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\constants.ts:34-67`

- [ ] **Step 1: Replace TSV_SCHEMA_MATCH and surrounding comments**

把 line 34-67 整段 (`// TSV column order ...` 到 `];`) 替換為：

```ts
// TSV column order for Match scouting - MUST match ScoutingData keys
// Note: autoPath is excluded - it goes in a separate QR code
// v1.6.0 (2026-04-21): 23 → 44 columns. First 17 unchanged; post 27 flattened
// (11 issue + 6 flag + 3 collision bool + 1 collision text + 5 rating + 1 comments).
// Removed legacy: robotDied / almostTipped / ridingOnBall / robotIssues / performance.
// v1.7.0 (2026-04-21): 44 → 47 columns. Add 3 fuel-action ratings
// (ratingIntakeFuel / ratingTransportFuel / ratingShootFuel) before `comments`.
// v1.8.0 (2026-04-26): 47 → 48 columns. Add issueShooterStutter
// (射球不順 — 射到一半短暫卡頓後恢復) inserted after issueShooterOff.
// v1.9.0 (2026-04-26): 48 → 48 columns. Remove Teleop bump/trench/fuelDropped (3),
// add PostMatch "Other" section (otherStealsOpponent boolean + ratingNeedFuel +
// ratingShotUnderDefense, 3 cols) before `comments`. Rename flag_stuckBall i18n
// label only (column key preserved).
export const TSV_SCHEMA_MATCH = [
  // PreMatch (6)
  'scouterName', 'eventCode', 'matchLevel', 'matchNumber', 'alliance', 'teamNumber',
  // Auto (3)
  'autoClimbStatus', 'autoClimbTime', 'autoClimbPosition',
  // Penalty (2)
  'minorPenalty', 'majorPenalty',
  // Climb (3)
  'teleClimbStatus', 'teleClimbTime', 'teleClimbPosition',
  // --- 14 above unchanged from v1.8.0 (Teleop bump/trench/fuelDropped removed) ---
  // PostMatch Issues (12) — 0/1
  'issueNoShow', 'issueCrashed', 'issueEStop', 'issueAStop', 'issueLowVoltage',
  'issueIntakeStuck', 'issueShooterOff', 'issueShooterStutter', 'issueStuckBump', 'issueHitTrench',
  'issuePartFell', 'issueMovement',
  // PostMatch Flags (6) — 0/1
  'flagYellowCard', 'flagRedCard', 'flagBelowExpected', 'flagTipped',
  'flagRidingFuel', 'flagStuckBall',
  // PostMatch Collision (3 bool + 1 text)
  'hasCollision', 'collisionField', 'collisionRobot', 'collisionTeamNumbers',
  // PostMatch Ratings (8) — good/ok/bad or empty
  'ratingPushTrench', 'ratingPushBump', 'ratingShoot', 'ratingHuman', 'ratingDefense',
  'ratingIntakeFuel', 'ratingTransportFuel', 'ratingShootFuel',
  // PostMatch Other (3) — v1.9.0
  'otherStealsOpponent',     // boolean: 0/1 — 去對方 alliance zone 偷球
  'ratingNeedFuel',          // good/ok/bad — alliance zone 需要有球
  'ratingShotUnderDefense',  // good/ok/bad — 被 defense 影響射球
  // PostMatch free-text (1)
  'comments',
];
```

- [ ] **Step 2: Verify length is 48**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && node -e "import('./constants.ts').then(m => console.log(m.TSV_SCHEMA_MATCH.length))"`

> 註：constants.ts 是 TS 檔，純 node 跑不了。改用下一步的 build 驗證。

- [ ] **Step 3: TypeScript build to verify no syntax errors**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run build`
Expected: build succeeds OR fails with errors about `bumpCount` / `trenchCount` / `fuelDroppedOnBumpCount` / `otherStealsOpponent` / `ratingNeedFuel` / `ratingShotUnderDefense`（types.ts 還沒改，預期會有 type 錯誤，下個 Task 會修）

---

### Task 2: 更新 `types.ts`

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\types.ts:96-103, 109-122, 134-145, 183-189, 196-228, 230-247`

- [ ] **Step 1: Remove 3 Teleop fields from ScoutingData interface**

刪除 line 100-102（在 `--- Teleop (2:20) ---` block 內）：
```ts
  bumpCount: number;             // Times crossed Bump
  trenchCount: number;           // Times crossed Trench
  fuelDroppedOnBumpCount: number; // Times dropped fuel on Bump crossing
```

- [ ] **Step 2: Add 3 Other fields to ScoutingData interface**

在 `comments: string;`（line 144 附近）**之前**插入：
```ts
  // PostMatch Other (3) — v1.9.0
  otherStealsOpponent: boolean;
  ratingNeedFuel: ChecklistRating;
  ratingShotUnderDefense: ChecklistRating;
```

- [ ] **Step 3: Update PostMatchChecklist interface**

把 PostMatchChecklist 的 ratings block (line 56-66) 替換為：
```ts
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
    needFuel:         ChecklistRating;  // v1.9.0 — alliance zone 需要有球
    shotUnderDefense: ChecklistRating;  // v1.9.0 — 被 defense 影響射球
  };

  // 「其他」區段 boolean (v1.9.0)
  stealsOpponent: boolean;
```

把 `stealsOpponent: boolean;` 加到 `extraComments?: string;` **之前**。

- [ ] **Step 4: Remove 3 Teleop fields from INITIAL_DATA**

刪除 line 187-189：
```ts
  bumpCount: 0,
  trenchCount: 0,
  fuelDroppedOnBumpCount: 0,
```

- [ ] **Step 5: Add 3 new flat fields to INITIAL_DATA**

在 `comments: '',`（line 230 附近）**之前**插入：
```ts
  // PostMatch Other (v1.9.0)
  otherStealsOpponent: false,
  ratingNeedFuel: '',
  ratingShotUnderDefense: '',
```

- [ ] **Step 6: Update INITIAL_DATA.postMatchChecklist.ratings**

把 INITIAL_DATA.postMatchChecklist.ratings (line 238-247) 替換為：
```ts
    ratings: {
      pushTrench: '',
      pushBump: '',
      shoot: '',
      human: '',
      defense: '',
      intakeFuel: '',
      transportFuel: '',
      shootFuel: '',
      needFuel: '',
      shotUnderDefense: '',
    },
    stealsOpponent: false,
```

`stealsOpponent: false,` 加在 `ratings: { ... }` block **之後**、`extraComments` 之前（如果有的話）或 `};` 之前。

- [ ] **Step 7: Build to verify**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run build`
Expected: 仍會有 TabViews / HistoryEditForm 的型別錯誤（後續 task 修），但 types.ts / constants.ts 應該過了。檢查 stderr 不應有來自 types.ts 的錯誤。

---

### Task 3: 更新 `utils/checklistSerializer.ts`

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\utils\checklistSerializer.ts:32-41, 82-91, 94-119`

- [ ] **Step 1: Split RATING_ROW_KEYS into MAIN + OTHER**

把 line 32-41（`export const RATING_ROW_KEYS = [...] as const;`）替換為：
```ts
// 動作評分區段（PostMatch「動作評分」UI 區塊）
export const MAIN_RATING_ROW_KEYS = [
  'pushTrench',
  'pushBump',
  'shoot',
  'human',
  'defense',
  'intakeFuel',
  'transportFuel',
  'shootFuel',
] as const;

// 「其他」區段（PostMatch「其他」UI 區塊，v1.9.0）
export const OTHER_RATING_ROW_KEYS = [
  'needFuel',
  'shotUnderDefense',
] as const;

// 全部 ratings — 序列化 / type 用
export const RATING_ROW_KEYS = [
  ...MAIN_RATING_ROW_KEYS,
  ...OTHER_RATING_ROW_KEYS,
] as const;
```

- [ ] **Step 2: Update RATING_FIELD_MAP**

把 line 82-91 的 `RATING_FIELD_MAP` block 替換為：
```ts
const RATING_FIELD_MAP: Record<RatingRow, keyof ScoutingData> = {
  pushTrench:    'ratingPushTrench',
  pushBump:      'ratingPushBump',
  shoot:         'ratingShoot',
  human:         'ratingHuman',
  defense:       'ratingDefense',
  intakeFuel:    'ratingIntakeFuel',
  transportFuel: 'ratingTransportFuel',
  shootFuel:     'ratingShootFuel',
  needFuel:         'ratingNeedFuel',
  shotUnderDefense: 'ratingShotUnderDefense',
};
```

- [ ] **Step 3: Add stealsOpponent → otherStealsOpponent in checklistToFlatFields**

把 `checklistToFlatFields` function (line 94-119) 替換為：
```ts
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

  // PostMatch「其他」區段 boolean (v1.9.0)
  out.otherStealsOpponent = c.stealsOpponent;

  out.comments = (c.extraComments ?? '').trim();

  return out;
}
```

- [ ] **Step 4: Build**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run build`
Expected: serializer 自身應該過，剩下的錯誤都是 UI 端 (TabViews / HistoryEditForm) 引用了已移除欄位 — Task 5-7 修。

- [ ] **Step 5: Commit Stage A**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC"
git add constants.ts types.ts utils/checklistSerializer.ts
git commit -m "$(cat <<'EOF'
feat(schema): add PostMatch Other section + remove Teleop counts (v1.9.0 stage A)

Schema/types/serializer changes only — UI follow in next commits.

- constants.ts: TSV_SCHEMA_MATCH 48 -> 48 (remove bumpCount/trenchCount/
  fuelDroppedOnBumpCount, add otherStealsOpponent + ratingNeedFuel +
  ratingShotUnderDefense before comments)
- types.ts: ScoutingData/INITIAL_DATA flat fields + PostMatchChecklist
  ratings.{needFuel,shotUnderDefense} + stealsOpponent boolean
- checklistSerializer.ts: split RATING_ROW_KEYS into MAIN/OTHER, map
  stealsOpponent -> otherStealsOpponent in checklistToFlatFields
EOF
)"
```

---

## Stage B：主 repo i18n + UI

### Task 4: 更新 `services/googleSheets.ts`

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\services\googleSheets.ts:76-87`

- [ ] **Step 1: Add 2 new ratings to PRESERVE_EMPTY_KEYS**

把 PRESERVE_EMPTY_KEYS Set (line 76-87) 替換為：
```ts
const PRESERVE_EMPTY_KEYS = new Set<string>([
  'comments',
  'collisionTeamNumbers',
  'ratingPushTrench',
  'ratingPushBump',
  'ratingShoot',
  'ratingHuman',
  'ratingDefense',
  'ratingIntakeFuel',
  'ratingTransportFuel',
  'ratingShootFuel',
  'ratingNeedFuel',          // v1.9.0
  'ratingShotUnderDefense',  // v1.9.0
]);
```

> 註：`otherStealsOpponent` 是 boolean，走 `'0'/'1'` 處理路徑，**不**加入這 Set。

- [ ] **Step 2: Build**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run build`
Expected: googleSheets.ts 應該過。剩下錯誤是 UI 端。

---

### Task 5: 更新 `contexts/LanguageContext.tsx` (i18n)

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\contexts\LanguageContext.tsx`

- [ ] **Step 1: Remove EN keys for 3 removed Teleop fields**

刪除這三行（line 34-36 附近）：
```ts
    bumpCount: "Bump Crossings",
    trenchCount: "Trench Crossings",
    fuelDroppedOnBump: "Fuel Dropped on Bump",
```

- [ ] **Step 2: Update EN flag_stuckBall label**

找到 line 76 附近：
```ts
    flag_stuckBall: "Stuck on ball",
```
改為：
```ts
    flag_stuckBall: "Stuck on fuel",
```

- [ ] **Step 3: Add EN new keys**

在 EN 區塊適當位置（建議在現有 rating_* 區塊之後，flag_* 區塊之後或附近，視組織方式）插入：
```ts
    // PostMatch「其他」區段 (v1.9.0)
    section_other: "Other",
    other_stealsOpponent: "Steals fuel from opponent zone",
    rating_needFuel: "Need fuel in alliance zone",
    rating_shotUnderDefense: "Shot accuracy under defense",
    // Per-row button labels (override default Good/OK/Poor)
    ratingNeedFuel_good: "Don't need",
    ratingNeedFuel_ok: "Normal",
    ratingNeedFuel_bad: "Need a lot",
    ratingShotUnderDefense_good: "Fine",
    ratingShotUnderDefense_ok: "Normal",
    ratingShotUnderDefense_bad: "Severe",
```

- [ ] **Step 4: Remove ZH keys for 3 removed Teleop fields**

刪除 line 226-228 附近：
```ts
    bumpCount: "穿越 Bump 次數",
    trenchCount: "穿越 Trench 次數",
    fuelDroppedOnBump: "穿越 Bump 時 Fuel 掉落",
```

- [ ] **Step 5: Update ZH flag_stuckBall label**

找到 line 268：
```ts
    flag_stuckBall: "卡在球上",
```
改為：
```ts
    flag_stuckBall: "卡在 fuel 上",
```

- [ ] **Step 6: Add ZH new keys**

在 ZH 區塊對稱位置插入：
```ts
    // PostMatch「其他」區段 (v1.9.0)
    section_other: "其他",
    other_stealsOpponent: "去對方 alliance zone 偷球",
    rating_needFuel: "alliance zone 需要有球",
    rating_shotUnderDefense: "被 defense 影響射球",
    // Per-row button labels
    ratingNeedFuel_good: "不需要",
    ratingNeedFuel_ok: "普通",
    ratingNeedFuel_bad: "很需要",
    ratingShotUnderDefense_good: "還好",
    ratingShotUnderDefense_ok: "普通",
    ratingShotUnderDefense_bad: "嚴重",
```

- [ ] **Step 7: Build**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run build`
Expected: i18n 是 string keys，build 不會抓 i18n typo。重點看 TabViews / HistoryEditForm 殘留錯誤。

---

### Task 6: 更新 `components/TabViews.tsx` Teleop 區段

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\components\TabViews.tsx:582-608`

- [ ] **Step 1: Remove 3 Counter components from TeleopTab**

把 line 582-608（從 `{/* Main Content */}` 到包含 Fuel Dropped on Bump 的 `</div>` 結尾）替換為：
```tsx
      {/* Main Content removed in v1.9.0 — bumpCount/trenchCount/fuelDroppedOnBumpCount
         no longer collected. Penalty + Climb sections render as primary content below. */}
```

實際 line 範圍：line 583 是 `<div className="grid grid-cols-1 gap-5">`，line 608 是該 div 的 `</div>`。整段 div 加上裡面的三個 Counter 全部移除（保留下方 Penalty 區段不動）。

更具體：刪除 line 583-608 整段 (`<div className="grid grid-cols-1 gap-5">` ... `</div>`)。

- [ ] **Step 2: Build**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run build`
Expected: TeleopTab 應該過了，剩下是 PostMatchTab 的 stealsOpponent / needFuel / shotUnderDefense 還沒 wire UI（仍未報錯，因為 type 已加但 UI 未必引用）。HistoryEditForm 仍有 3 個未移除欄位的引用 → 報錯。

---

### Task 7: 更新 `components/TabViews.tsx` PostMatch 區段加「其他」可摺疊區段

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\components\TabViews.tsx`（PostMatchTab function 內，約 line 712-953）

- [ ] **Step 1: Update imports at top of file**

找到引入 `RATING_ROW_KEYS` 的 import 行，改為同時 import `MAIN_RATING_ROW_KEYS` 和 `OTHER_RATING_ROW_KEYS`：

```tsx
import {
  ISSUE_KEYS, FLAG_KEYS, MAIN_RATING_ROW_KEYS, OTHER_RATING_ROW_KEYS,
  RATING_VALUES, IssueKey, FlagKey, RatingRow,
  toggleInArray, checklistToFlatFields,
} from '../utils/checklistSerializer';
```

（具體 import 樣式以 file 中現有為準，添加 MAIN_RATING_ROW_KEYS 和 OTHER_RATING_ROW_KEYS。如果 file 沒 import RATING_ROW_KEYS，找 ISSUE_KEYS 那一段加入。）

- [ ] **Step 2: Add showOther state**

在 PostMatchTab function 開頭找到：
```tsx
  const [showIssues, setShowIssues] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
```
加一行：
```tsx
  const [showOther, setShowOther] = useState(false);
```

- [ ] **Step 3: Update fallback checklist default in PostMatchTab**

找到 `const checklist: PostMatchChecklist = data.postMatchChecklist ?? {...}` block (line 717-726)，把 `ratings: { pushTrench: '', pushBump: '', shoot: '', human: '', defense: '' }` 替換為：

```tsx
    ratings: {
      pushTrench: '', pushBump: '', shoot: '', human: '', defense: '',
      intakeFuel: '', transportFuel: '', shootFuel: '',
      needFuel: '', shotUnderDefense: '',
    },
    stealsOpponent: false,
```

確認 `stealsOpponent: false` 加進該 fallback object。

- [ ] **Step 4: Replace RATING_ROW_KEYS reference in main "動作評分" block**

找到 PostMatchTab 的 ratings 渲染區塊（約 line 900）：
```tsx
              {RATING_ROW_KEYS.map(row => (
```
改為：
```tsx
              {MAIN_RATING_ROW_KEYS.map(row => (
```

這樣「動作評分」區塊只渲染 8 個既有 ratings，「其他」的 2 個 ratings 由新區段獨立渲染。

- [ ] **Step 5: Add 「其他」collapsible section before free-text comments**

找到 line 940 附近的：
```tsx
      {/* Free-text comments */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase">{t('comments')}</label>
```

在這個 `<div className="space-y-2">` **之前**插入完整的「其他」區段：

```tsx
      {/* Section: 其他 (collapsible) — v1.9.0 */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowOther(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
        >
          <span className="text-sm font-bold text-slate-300 uppercase">
            {t('section_other')}
            {(() => {
              const count = (checklist.stealsOpponent ? 1 : 0)
                + (checklist.ratings.needFuel !== '' ? 1 : 0)
                + (checklist.ratings.shotUnderDefense !== '' ? 1 : 0);
              return count > 0 ? (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                  {count}
                </span>
              ) : null;
            })()}
          </span>
          <span className={`text-slate-400 transition-transform ${showOther ? 'rotate-180' : ''}`}>▾</span>
        </button>
        {showOther && (
          <div className="px-4 pb-4 space-y-3">
            {/* Steals from opponent (boolean toggle) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <Toggle
                label={t('other_stealsOpponent')}
                checked={checklist.stealsOpponent}
                onChange={v => updateChecklist({ stealsOpponent: v })}
                variant="warning"
              />
            </div>

            {/* OTHER rating rows with per-row custom button labels */}
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              {OTHER_RATING_ROW_KEYS.map(row => {
                const tKey = (suffix: string) => `rating${row.charAt(0).toUpperCase()}${row.slice(1)}_${suffix}`;
                return (
                  <div key={row} className="space-y-1">
                    <div className="text-sm text-slate-300">{tAny(`rating_${row}`)}</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRating(row, '')}
                        className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all active:scale-95 ${
                          checklist.ratings[row] === ''
                            ? 'bg-slate-700 border-slate-500 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-500'
                        }`}
                      >
                        —
                      </button>
                      {RATING_VALUES.map(v => {
                        const active = checklist.ratings[row] === v;
                        const colorClass =
                          v === 'good' ? (active ? 'bg-green-500/30 border-green-500 text-green-300' : 'bg-slate-900 border-slate-700 text-slate-400') :
                          v === 'ok'   ? (active ? 'bg-amber-500/30 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400') :
                                         (active ? 'bg-red-500/30 border-red-500 text-red-300'     : 'bg-slate-900 border-slate-700 text-slate-400');
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setRating(row, v)}
                            className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all active:scale-95 ${colorClass}`}
                          >
                            {tAny(tKey(v))}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

```

> 注意：此區塊 row label 用 `rating_${row}` 同既有；button label 用 per-row key `rating{Row}_${v}`（例如 `ratingNeedFuel_good`）。

- [ ] **Step 6: Build**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run build`
Expected: TabViews 應該過了。如報 `Toggle` 未 import，看 file 頂部 import block，確認 `Toggle` 已被 import（既有 collision toggle 使用）— 通常已在。

---

### Task 8: 更新 `components/HistoryEditForm.tsx`

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\components\HistoryEditForm.tsx:84-110`

- [ ] **Step 1: Remove 3 Teleop count input blocks**

找到並刪除 line 84-110 的 3 個 input block（bumpCount + trenchCount + fuelDroppedOnBumpCount）。完整刪除範圍：
- bumpCount block (line 83-92 附近，含 `<label>` + `<input>` + 包圍 `<div>`)
- trenchCount block (line 93-101 附近)
- fuelDroppedOnBumpCount block (line 102-110 附近)

具體 line 範圍以實際 file 為準。執行 Read 確認 block 邊界後刪除整三個 div。

- [ ] **Step 2: Build**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run build`
Expected: build SUCCEEDS — 主 repo 程式碼端完成。

---

## Stage C：主 repo 驗證 + commit

### Task 9: 主 repo 程式化驗證 + commit/push

- [ ] **Step 1: Grep verify removed fields are 0 references in code**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC"
echo "=== bumpCount references ===" && grep -rn "bumpCount" --include="*.ts" --include="*.tsx" -- src/ components/ contexts/ services/ utils/ types.ts constants.ts App.tsx 2>/dev/null || true
echo "=== trenchCount references ===" && grep -rn "trenchCount" --include="*.ts" --include="*.tsx" -- src/ components/ contexts/ services/ utils/ types.ts constants.ts App.tsx 2>/dev/null || true
echo "=== fuelDroppedOnBumpCount references ===" && grep -rn "fuelDroppedOnBumpCount" --include="*.ts" --include="*.tsx" -- src/ components/ contexts/ services/ utils/ types.ts constants.ts App.tsx 2>/dev/null || true
echo "=== fuelDroppedOnBump (i18n key) references ===" && grep -rn '"fuelDroppedOnBump"\|t(.fuelDroppedOnBump.)' --include="*.ts" --include="*.tsx" -- src/ components/ contexts/ services/ utils/ types.ts constants.ts App.tsx 2>/dev/null || true
```
Expected: 0 hits in code files (docs/specs/PROGRESS.md/FINDINGS.md hits OK，那些是歷史紀錄)。

- [ ] **Step 2: Grep verify new fields exist**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC"
grep -rn "otherStealsOpponent\|ratingNeedFuel\|ratingShotUnderDefense\|stealsOpponent\|needFuel\|shotUnderDefense" --include="*.ts" --include="*.tsx" -- types.ts constants.ts utils/ services/ contexts/ components/ 2>/dev/null
```
Expected: 多筆 hits 涵蓋 constants.ts (3)、types.ts (~6)、checklistSerializer.ts (~6)、googleSheets.ts (2)、LanguageContext.tsx (~14)、TabViews.tsx (~6)。

- [ ] **Step 3: Build**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run build`
Expected: build PASSES with no errors.

- [ ] **Step 4: Commit Stage B/C**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC"
git add services/googleSheets.ts contexts/LanguageContext.tsx components/TabViews.tsx components/HistoryEditForm.tsx
git commit -m "$(cat <<'EOF'
feat(ui): wire PostMatch Other section + remove Teleop counts UI (v1.9.0 stage B)

- googleSheets.ts: PRESERVE_EMPTY_KEYS += ratingNeedFuel, ratingShotUnderDefense
- LanguageContext.tsx: remove bumpCount/trenchCount/fuelDroppedOnBump i18n
  (EN+ZH), rename flag_stuckBall label "Stuck on ball" -> "Stuck on fuel"
  (key preserved), add 11 new keys for Other section + per-row button labels
- TabViews.tsx Teleop: remove 3 Counter components
- TabViews.tsx PostMatch: add collapsible "Other" section (1 boolean toggle
  + 2 ratings with per-row labels), split RATING_ROW_KEYS use into
  MAIN_RATING_ROW_KEYS for main section
- HistoryEditForm.tsx: remove 3 Teleop count input fields
EOF
)"
```

- [ ] **Step 5: Push main repo**

```bash
git push origin main
```

---

## Stage D：Scanner repo 同步

### Task 10: 更新 Scanner `src/constants/schema.ts`

**Files:**
- Modify: `D:\FRC\frc-scout-scanner\src\constants\schema.ts:5-9, 22-25, 67-70, 188-197, 211-213, 245-253`

- [ ] **Step 1: Update file header comment**

把 line 5-9 的 schema 版本註解替換為：
```ts
// Match Data TSV Schema (48 栏位) - v1.9.0
// 必须与 Scouting PASS 的 constants.ts 保持一致
// v1.5.0: comments 拆成 robotIssues / performance / comments 三欄
// v1.6.0: 23 → 44 欄；扁平化 issue/flag/collision/rating；移除 robotDied/almostTipped/ridingOnBall/robotIssues/performance
// v1.7.0: 44 → 47 欄；新增 3 個 fuel 動作評分（ratingIntakeFuel / ratingTransportFuel / ratingShootFuel）
// v1.8.0: 47 → 48 欄；新增 issueShooterStutter（射球不順）
// v1.9.0: 48 → 48 欄；移除 Teleop bump/trench/fuelDropped (3 欄)，新增「其他」區段
//         (otherStealsOpponent + ratingNeedFuel + ratingShotUnderDefense, 3 欄) 在 comments 之前
```

- [ ] **Step 2: Remove 3 Teleop fields from TSV_SCHEMA_MATCH**

刪除 line 22-25：
```ts
  // Teleop - Bump & Fuel (3)
  'bumpCount',
  'trenchCount',
  'fuelDroppedOnBumpCount',
```

並移除前面的 comment line `// Teleop - Bump & Fuel (3)`，把後面 `// Teleop - Penalty (2)` 改為更清楚的 `// Penalty (2)`。

- [ ] **Step 3: Add 3 Other fields before comments**

找到 line 67-69:
```ts
  'ratingShootFuel',      // v1.7.0
  // PostMatch free-text
  'comments',
```

替換為：
```ts
  'ratingShootFuel',      // v1.7.0
  // PostMatch Other (3) — v1.9.0
  'otherStealsOpponent',     // boolean: 0/1
  'ratingNeedFuel',          // good/ok/bad
  'ratingShotUnderDefense',  // good/ok/bad
  // PostMatch free-text
  'comments',
```

- [ ] **Step 4: Update SCHEMA_LENGTHS comment**

找到 line 190：
```ts
  match: TSV_SCHEMA_MATCH.length,      // 47 (v1.7.0)
```

改為：
```ts
  match: TSV_SCHEMA_MATCH.length,      // 48 (v1.9.0)
```

> 註：line 數值不需手動算，TS 會在 runtime 用 `.length` 自動計算。只是更新 comment。

- [ ] **Step 5: Remove 3 Teleop FIELD_LABELS**

刪除 line 211-213：
```ts
  bumpCount: 'Bump 跨越次数',
  trenchCount: 'Trench 跨越次数',
  fuelDroppedOnBumpCount: '掉落次数',
```

- [ ] **Step 6: Update flagStuckBall label (簡中) — keep key**

找到 `flagStuckBall: '卡球',` （line 238 附近）替換為：
```ts
  flagStuckBall: '卡 fuel',
```

> 註：scanner 的 FIELD_LABELS 為簡中，保持原本「卡球 → 卡 fuel」的精簡風格（與主 repo 繁中「卡在球上 → 卡在 fuel 上」對應但更簡）。

- [ ] **Step 7: Add 3 new FIELD_LABELS for Other section**

找到 line 252-254 附近的：
```ts
  ratingShootFuel: '射击 fuel',
  // PostMatch Comments
  comments: '备注',
```

替換為：
```ts
  ratingShootFuel: '射击 fuel',
  // PostMatch Other (v1.9.0)
  otherStealsOpponent: '去对方 alliance zone 偷球',
  ratingNeedFuel: 'alliance zone 需要有球',
  ratingShotUnderDefense: '被 defense 影响射球',
  // PostMatch Comments
  comments: '备注',
```

- [ ] **Step 8: Build scanner**

```bash
cd "D:/FRC/frc-scout-scanner" && npm run build
```
Expected: build PASSES.

---

### Task 11: 更新 Scanner `src/utils/decoder.ts` 註解

**Files:**
- Modify: `D:\FRC\frc-scout-scanner\src\utils\decoder.ts:29-30`

- [ ] **Step 1: Update version comment**

把 line 29-30：
```ts
  // v1.8.0: match 已擴充到 48 欄，不再與 pit-external 衝突。
  if (length === TSV_SCHEMA_MATCH.length) return 'match';                       // 48 (v1.8.0)
```

改為：
```ts
  // v1.9.0: match 維持 48 欄但結構大改（移除 Teleop bump/trench/fuelDropped 3 欄，新增 Other 區段 3 欄）。
  if (length === TSV_SCHEMA_MATCH.length) return 'match';                       // 48 (v1.9.0)
```

> Logic 不變，`detectQRType` 用 `.length` 動態比對。

- [ ] **Step 2: Build**

```bash
cd "D:/FRC/frc-scout-scanner" && npm run build
```
Expected: build PASSES.

---

### Task 12: 更新 Scanner i18n locales (`en.ts` + `zh-TW.ts`)

**Files:**
- Modify: `D:\FRC\frc-scout-scanner\src\i18n\locales\en.ts:178-219`
- Modify: `D:\FRC\frc-scout-scanner\src\i18n\locales\zh-TW.ts:178-219`

- [ ] **Step 1: Update en.ts header comment**

找到 line 178：
```ts
  // Field Labels (v1.7.0)
```
改為：
```ts
  // Field Labels (v1.9.0)
```

- [ ] **Step 2: Remove 3 Teleop fields from en.ts**

刪除 line 192-194（`fields:` block 內）：
```ts
    bumpCount: 'Bump Crossings',
    trenchCount: 'Trench Crossings',
    fuelDroppedOnBumpCount: 'Fuel Dropped on Bump',
```

也刪除前面的 comment `// Teleop` 如果只剩 climb/penalty 該 comment 改為 `// Penalty + Climb`。

- [ ] **Step 3: Update flagStuckBall in en.ts**

找到 line 219:
```ts
    flagStuckBall: 'Stuck Ball',
```
改為：
```ts
    flagStuckBall: 'Stuck on fuel',
```

- [ ] **Step 4: Add 3 new fields to en.ts**

在 `// PostMatch Ratings` block 結尾、`comments: 'Comments',` 之前插入：
```ts
    // PostMatch Other (v1.9.0)
    otherStealsOpponent: 'Steals from opponent zone',
    ratingNeedFuel: 'Need fuel in alliance',
    ratingShotUnderDefense: 'Shot under defense',
```

- [ ] **Step 5: Update zh-TW.ts header comment**

找到對應 `// Field Labels (v1.7.0)` 改為 `// Field Labels (v1.9.0)`。

- [ ] **Step 6: Remove 3 Teleop fields from zh-TW.ts**

刪除 line 190-192：
```ts
    bumpCount: 'Bump 跨越次數',
    trenchCount: 'Trench 跨越次數',
    fuelDroppedOnBumpCount: '跨 Bump 時掉 Fuel',
```

- [ ] **Step 7: Update flagStuckBall in zh-TW.ts**

找到 zh-TW.ts 對應 flagStuckBall 行，改為：
```ts
    flagStuckBall: '卡在 fuel 上',
```

- [ ] **Step 8: Add 3 new fields to zh-TW.ts**

在對應位置插入：
```ts
    // PostMatch Other (v1.9.0)
    otherStealsOpponent: '去對方 alliance zone 偷球',
    ratingNeedFuel: 'alliance zone 需要有球',
    ratingShotUnderDefense: '被 defense 影響射球',
```

- [ ] **Step 9: Build**

```bash
cd "D:/FRC/frc-scout-scanner" && npm run build
```
Expected: build PASSES.

---

### Task 13: 更新 Scanner `google-apps-script/Code.gs`

**Files:**
- Modify: `D:\FRC\frc-scout-scanner\google-apps-script\Code.gs`（多處）

- [ ] **Step 1: Update header comment block**

找到 line 56 附近的 `const TSV_SCHEMA_MATCH = [` 上方的 comment block，加上 v1.9.0 條目（如已有 v1.8.0 條目）：
```js
 * - v1.9.0 (2026-04-26): 48 → 48 欄
 *   - 移除 Teleop bumpCount / trenchCount / fuelDroppedOnBumpCount (3 欄)
 *   - 新增 PostMatch「其他」區段 otherStealsOpponent + ratingNeedFuel +
 *     ratingShotUnderDefense (3 欄) 在 comments 之前
 *   - flag_stuckBall i18n label 改名（key 不變）
```

- [ ] **Step 2: Remove 3 Teleop fields from TSV_SCHEMA_MATCH array**

找到 line 69-71（`'bumpCount',`、`'trenchCount',`、`'fuelDroppedOnBumpCount',`）整 3 行刪除。

連帶把後續欄位編號註解 `// 9: ...`、`// 10: ...`、`// 11: ...`、... 以及之後的全部欄位編號註解 **重新編號**減 3。

> 重要：欄位編號註解只是 readability，不影響功能。但本次與其漏改，不如全部重排一次保持一致。

- [ ] **Step 3: Add 3 Other fields to TSV_SCHEMA_MATCH array**

找到 `comments` 那行（schema 最後一個欄位），在它之前插入：
```js
  'otherStealsOpponent',      // 45: PostMatch Other - 偷球 (v1.9.0)
  'ratingNeedFuel',           // 46: PostMatch Other - 需要球 (v1.9.0)
  'ratingShotUnderDefense',   // 47: PostMatch Other - 被 defense 影響射球 (v1.9.0)
```

> 編號 45-47 假設 comments 是 idx 47；實際 idx 看 v1.8.0 schema 對應位置。重點：插在 ratingShootFuel 之後、comments 之前。

- [ ] **Step 4: Update version string**

找到 line 207：
```js
    version: '1.8.0',
```
改為：
```js
    version: '1.9.0',
```

- [ ] **Step 5: Clean up test data references (line 1144-1336)**

找到所有測試資料中提到 `bumpCount`、`trenchCount`、`fuelDroppedOnBumpCount` 的行（line 1144-1146 + line 1255-1336 各列）。

策略：直接整段刪除測試資料中這 3 個 keys（保留其他欄位如 `minorPenalty`、`majorPenalty`）。

例：line 1255 原本：
```js
      bumpCount:'2', trenchCount:'1', fuelDroppedOnBumpCount:'0', minorPenalty:'0', majorPenalty:'0',
```
改為：
```js
      minorPenalty:'0', majorPenalty:'0',
```

對 line 1144-1146 + line 1255-1336 所有相關行進行同樣處理。

> 註：這些是 GAS 內部 mock/test 資料，不影響 production schema 比對，但同步清理避免日後混淆。

- [ ] **Step 6: Verify TSV_SCHEMA_MATCH structure**

開啟 GAS 編輯器（或本地語法檢查）；用 grep 確認：
```bash
cd "D:/FRC/frc-scout-scanner"
grep -c "'" google-apps-script/Code.gs | head -1
grep -n "TSV_SCHEMA_MATCH" google-apps-script/Code.gs
```

確認 array 結構閉合 OK，無 syntax 殘留。

---

## Stage E：驗證 + commit

### Task 14: 三方 schema 程式化驗證

**Files:**
- Verify only: 三 repo 的 `TSV_SCHEMA_MATCH`

- [ ] **Step 1: 寫驗證腳本（一次性，跑完丟棄）**

在臨時位置（例如 `D:/FRC/frc-6998-scouting-pass/FRC/scripts/verify-v1.9.cjs`，跑完不 commit）寫：

```js
// 寫入並執行：
const fs = require('fs');

const stripJSONOf = (filepath, label) => {
  const content = fs.readFileSync(filepath, 'utf8');
  const match = content.match(/TSV_SCHEMA_MATCH\s*=\s*\[([\s\S]*?)\]/);
  if (!match) throw new Error(`No TSV_SCHEMA_MATCH array in ${label}`);
  const items = match[1]
    .split(/\n/).map(s => s.trim())
    .filter(s => s.startsWith("'") || s.startsWith('"'))
    .map(s => s.replace(/^['"]/, '').replace(/['"].*$/, ''));
  return items;
};

const main    = stripJSONOf('D:/FRC/frc-6998-scouting-pass/FRC/constants.ts', 'main');
const scanner = stripJSONOf('D:/FRC/frc-scout-scanner/src/constants/schema.ts', 'scanner');
const gas     = stripJSONOf('D:/FRC/frc-scout-scanner/google-apps-script/Code.gs', 'gas');

console.log('main length:    ', main.length);
console.log('gas length:     ', gas.length);
console.log('scanner length: ', scanner.length);

const cmpArrays = (a, b, label) => {
  if (a.length !== b.length) { console.log(`${label}: LENGTH MISMATCH ${a.length} vs ${b.length}`); return; }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) { console.log(`${label}: idx ${i} differs: ${a[i]} vs ${b[i]}`); return; }
  }
  console.log(`${label}: OK`);
};

cmpArrays(main, gas, 'main vs gas    ');
cmpArrays(main, scanner, 'main vs scanner');

const removed = ['bumpCount', 'trenchCount', 'fuelDroppedOnBumpCount'];
const added = ['otherStealsOpponent', 'ratingNeedFuel', 'ratingShotUnderDefense'];

console.log('\nRemoved (must NOT exist):');
removed.forEach(k => {
  const m = main.includes(k), g = gas.includes(k), s = scanner.includes(k);
  console.log(`  ${k.padEnd(28)} main: ${m?'✗':'✓'} gas: ${g?'✗':'✓'} scanner: ${s?'✗':'✓'} ${(!m && !g && !s) ? 'OK' : 'FAIL'}`);
});

console.log('\nAdded (must exist at same idx):');
added.forEach(k => {
  const mIdx = main.indexOf(k), gIdx = gas.indexOf(k), sIdx = scanner.indexOf(k);
  console.log(`  ${k.padEnd(28)} main idx: ${mIdx} gas: ${gIdx} scanner: ${sIdx} ${(mIdx === gIdx && gIdx === sIdx && mIdx >= 0) ? 'OK' : 'FAIL'}`);
});
```

- [ ] **Step 2: Run verification**

Run: `cd "D:/FRC/frc-6998-scouting-pass/FRC" && node scripts/verify-v1.9.cjs`

Expected output (similar to)：
```
main length:    48
gas length:     48
scanner length: 48
main vs gas    : OK
main vs scanner: OK

Removed (must NOT exist):
  bumpCount                    main: ✓ gas: ✓ scanner: ✓ OK
  trenchCount                  main: ✓ gas: ✓ scanner: ✓ OK
  fuelDroppedOnBumpCount       main: ✓ gas: ✓ scanner: ✓ OK

Added (must exist at same idx):
  otherStealsOpponent          main idx: 45 gas: 45 scanner: 45 OK
  ratingNeedFuel               main idx: 46 gas: 46 scanner: 46 OK
  ratingShotUnderDefense       main idx: 47 gas: 47 scanner: 47 OK
```

如有任何 FAIL，回到對應 task 修復。

- [ ] **Step 3: Delete the temporary verify script**

```bash
rm D:/FRC/frc-6998-scouting-pass/FRC/scripts/verify-v1.9.cjs
```
（或保留但不 commit，加入 .gitignore 也可）

---

### Task 15: Scanner repo commit + push

- [ ] **Step 1: Stage changes**

```bash
cd "D:/FRC/frc-scout-scanner"
git add src/constants/schema.ts src/utils/decoder.ts src/i18n/locales/en.ts src/i18n/locales/zh-TW.ts google-apps-script/Code.gs
git status  # confirm only these 5 files
```

- [ ] **Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(schema): sync to v1.9.0 (remove Teleop counts, add PostMatch Other)

配合 Scouting PASS v1.9.0：48 → 48 欄但結構大改。
三處鏡像 + i18n 全部同步：

- google-apps-script/Code.gs: TSV_SCHEMA_MATCH 移除 3 Teleop 計數欄
  + 新增 3 PostMatch Other 欄 + version 1.8.0 -> 1.9.0
  + 測試資料清理 + 編號註解全部更新
- src/constants/schema.ts: TSV_SCHEMA_MATCH + FIELD_LABELS 同步
  + flag_stuckBall label 簡中改「卡球」-> 「卡 fuel」(key 不動)
- src/utils/decoder.ts: 註解 v1.8.0 -> v1.9.0
  (detectQRType 已用 .length 動態，邏輯自動跟上)
- src/i18n/locales/en.ts: 移 3 + 加 3 + flagStuckBall "Stuck on fuel"
- src/i18n/locales/zh-TW.ts: 移 3 + 加 3 + flagStuckBall「卡在 fuel 上」

三方 schema 程式化驗證通過：
  main / gas / scanner 都是 48 欄，
  removed bumpCount/trenchCount/fuelDroppedOnBumpCount 在三方都消失，
  added otherStealsOpponent/ratingNeedFuel/ratingShotUnderDefense 在三方 idx 一致
EOF
)"
```

- [ ] **Step 3: Push**

```bash
git push origin main
```

---

## Stage F：文件 + 部署提示

### Task 16: 更新 main repo 文件 (CLAUDE.md + PROGRESS.md)

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\CLAUDE.md`
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\PROGRESS.md`

- [ ] **Step 1: Update CLAUDE.md schema description**

找到 CLAUDE.md 中 `TSV Schema:` 的描述（line 111-119），更新版本到 v1.9.0：
- v1.8.0 → v1.9.0
- 48 欄結構新描述：14 (PreMatch+Auto+Penalty+Climb) + 12 issue + 6 flag + 4 collision + 8 rating + 3 other + 1 comment = 48
- 標明 v1.9.0 移除 Teleop 3 欄、新增 Other 區段、flag_stuckBall label 改名

找到 Form Structure 表格（line 107-109），把 Teleop 行：
```
| Teleop | bumpCount, trenchCount, fuelDroppedOnBump, teleFuel, minorPenalty, majorPenalty, teleClimbStatus, teleClimbPosition, teleClimbTime (Stopwatch) |
```
改為：
```
| Teleop | minorPenalty, majorPenalty, teleClimbStatus, teleClimbPosition, teleClimbTime (Stopwatch) |
```

找到 PostMatch 行 (line 109)，更新描述至：
```
| PostMatch | defenseRating, driverSkill, speedRating, subjectiveNotes, **postMatchChecklist** (issues/flags/collision/ratings/**otherSection**/extraComments) — 扁平化為 31 欄：12 issue (0/1) + 6 flag (0/1) + 4 collision (3 bool + 1 text) + 8 rating + 3 other (1 bool + 2 rating) + 1 comments |
```

- [ ] **Step 2: Add CLAUDE.md Common Pitfalls 條目**

在 Common Pitfalls section 末尾（既有 v1.7.0 / v1.8.0 條目之後）加：
```
- ✅ **PostMatch「其他」區段 + Teleop 三欄移除已完成 (2026-04-26)**: v1.9.0 = 48 欄但結構大改。移除 Teleop bumpCount/trenchCount/fuelDroppedOnBumpCount。新增「其他」可摺疊區段：otherStealsOpponent (boolean) + ratingNeedFuel + ratingShotUnderDefense（每 row 客製 button label：不需要/普通/很需要、還好/普通/嚴重）。flag_stuckBall i18n label 改「Stuck on fuel」/「卡在 fuel 上」(key 不變)。RATING_ROW_KEYS 拆 MAIN(8) + OTHER(2)。**部署時必跑 fixHeaders**（欄位順序大改）
- ⚠️ **per-row rating button label**: 「其他」區段的 2 個 rating row 用 `rating{Row}_${value}` i18n key 客製按鈕標籤（如 `ratingNeedFuel_good = '不需要'`）；既有 8 個 rating row 仍用共用 `rating_good/ok/bad`。新增此類 row 時需同時加 6 個 per-row label keys
```

- [ ] **Step 3: Append new session to PROGRESS.md**

在檔案末尾（line 2431 之後），加新 session：

```markdown

---

## Session: 2026-04-26 (Part 2) — PostMatch 「其他」區段 + Teleop 三欄移除 (v1.9.0)

### Overview
使用者要求三件事：(1) PostMatch 新增「其他」區段含 1 boolean (偷球) + 2 rating (需要球 / 被 defense 影響)、(2) Teleop 移除 bumpCount/trenchCount/fuelDroppedOnBumpCount 三 Counter、(3) flag_stuckBall i18n label 從「Stuck on ball/卡在球上」改「Stuck on fuel/卡在 fuel 上」（key 不動）。schema 從 v1.8.0 (48 欄) → v1.9.0 (48 欄但結構大改)。

### Phase 47: v1.9.0 Schema 改造
- **Status:** ✅ complete

#### 主 repo 改動 (8 檔)
- `constants.ts`: TSV_SCHEMA_MATCH 移 3 加 3 + v1.9.0 註解
- `types.ts`: ScoutingData 移 3 加 3、INITIAL_DATA、PostMatchChecklist 加 stealsOpponent + ratings.{needFuel,shotUnderDefense}
- `utils/checklistSerializer.ts`: 拆 RATING_ROW_KEYS 為 MAIN(8) + OTHER(2)、加 stealsOpponent → otherStealsOpponent 處理
- `services/googleSheets.ts`: PRESERVE_EMPTY_KEYS += ratingNeedFuel + ratingShotUnderDefense
- `contexts/LanguageContext.tsx`: 移 3 i18n + flag_stuckBall label 改名 + 加 11 keys（含 6 個 per-row button label）
- `components/TabViews.tsx`: Teleop 移 3 Counter + PostMatch 加「其他」可摺疊區段
- `components/HistoryEditForm.tsx`: 移 3 input field
- `CLAUDE.md`: 文件更新

#### Scanner repo 改動 (5 檔)
- `src/constants/schema.ts` + `src/utils/decoder.ts` + i18n 雙 locale + `Code.gs` (含 version 1.9.0 + 測試資料清理)

#### 程式化驗證
```
main length: 48 | gas length: 48 | scanner length: 48
main vs gas / main vs scanner: OK
removed bumpCount/trenchCount/fuelDroppedOnBumpCount: 三方都消失 ✓
added otherStealsOpponent/ratingNeedFuel/ratingShotUnderDefense: 三方 idx 一致 ✓
```

#### 部署順序
1. ✅ 主 repo + scanner repo 各自 push
2. ⏸ 使用者：把 scanner 最新 Code.gs 覆貼到 GAS → 部署新版（version 1.9.0）
3. ⏸ 使用者：對每個活躍 Sheet GET `?action=fixHeaders` 升級到 48 欄新順序標頭（**必跑**）
4. ⏸ 使用者：端對端 QR 掃描驗證

---

## 5-Question Reboot Check（給明日接續用）

1. **做什麼？** Phase 47：v1.9.0 schema 改造 — Teleop 移 3、PostMatch 加 Other 區段 (3 欄)、flag_stuckBall label 改名
2. **進度？** ✅ 兩 repo commits 已 push；主 repo + scanner repo build 通過；三方 schema 程式化驗證 OK
3. **下一步？** 使用者外部手動操作：(a) GAS 部署 v1.9.0、(b) 對活躍 Sheet `?action=fixHeaders`（必跑）、(c) 端對端 QR 驗證
4. **阻礙？** 無程式碼阻礙；僅外部部署待使用者執行
5. **檔案？** 主 repo: `constants.ts`、`types.ts`、`utils/checklistSerializer.ts`、`services/googleSheets.ts`、`contexts/LanguageContext.tsx`、`components/TabViews.tsx`、`components/HistoryEditForm.tsx`、`CLAUDE.md`、`PROGRESS.md`；Scanner repo: 同 v1.8.0 五檔

---
*Last updated: 2026-04-26 (Phase 47 — v1.9.0 PostMatch Other section + Teleop trim)*
```

- [ ] **Step 4: Commit docs**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC"
git add CLAUDE.md PROGRESS.md
git commit -m "$(cat <<'EOF'
docs: update CLAUDE.md and PROGRESS.md for v1.9.0

- CLAUDE.md: schema description updated to 48-col v1.9.0 structure,
  Form Structure table reflects Teleop trim, PostMatch new "其他"
  section, new common pitfalls entries
- PROGRESS.md: append Phase 47 session log + 5-Question Reboot Check
EOF
)"
git push origin main
```

---

### Task 17: 部署提示給使用者

- [ ] **Step 1: 整理部署 checklist 給使用者執行**

訊息給使用者：
```
✅ 程式碼端 v1.9.0 完成（兩 repo 共 4 commits 已 push 到 origin/main）
✅ 主 repo + scanner repo build 都過
✅ 三方 schema 程式化驗證通過

請手動執行外部步驟：

1. 把 D:\FRC\frc-scout-scanner\google-apps-script\Code.gs
   覆貼到 GAS project，然後「部署 → 管理部署作業 → 編輯 → 新版本 → 部署」
   （內部版本字串應顯示 1.9.0）

2. 對每個活躍 Sheet 在瀏覽器開：
   <你的 webAppUrl>?action=fixHeaders
   （本次因移除 3 欄 + 新增 3 欄 + 順序改變 → 必跑！）

3. 端對端驗證：
   - 用 main repo 跑 npm run dev，填一筆完整 PostMatch（含「其他」區段三題）
   - 產生 Match QR，scanner 掃描
   - 確認解碼出 48 欄、偷球輸出 '1'、需要球/被 defense 輸出 'good'/'ok'/'bad'
   - Sheet 收到資料後檢查欄位對齊正確
```

---

## Self-Review Checklist

- [x] **Spec coverage**: spec 12 個 sections 全部 → tasks 對應
  - Section 1 (動機) → 無 task（context only）
  - Section 2 (變動總覽) → Task 1 (schema)
  - Section 3 (Schema) → Task 1 (constants.ts)
  - Section 4 (Type) → Task 2 (types.ts)
  - Section 5 (UI) → Task 6 (TabViews 加區段) + Task 7 (TabViews PostMatch)
  - Section 6 (i18n) → Task 5
  - Section 7 (序列化) → Task 3
  - Section 8 (Sheets) → Task 4
  - Section 9 (Scanner mirror) → Task 10-13
  - Section 10 (部署) → Task 14 程式化驗證 + Task 17 部署提示
  - Section 11 (踩坑對照) → 散布在各 task + Task 16 文件
  - Section 12 (命名決策) → Task 1 schema + Task 16 文件
- [x] **Placeholder scan**: 所有 step 都有具體 code/command，無 TBD
- [x] **Type consistency**:
  - `stealsOpponent`（PostMatchChecklist key） → `otherStealsOpponent`（ScoutingData column）一致
  - `needFuel` / `shotUnderDefense`（ratings key） → `ratingNeedFuel` / `ratingShotUnderDefense`（ScoutingData column）一致
  - i18n key per-row：`ratingNeedFuel_good` / `ratingShotUnderDefense_good` 等一致
- [x] **Build命令一致性**: 主 repo 與 scanner repo 都用 `npm run build`
- [x] **Commit 顆粒度**: Stage A (1 commit) → Stage B/C (1 commit) → Stage D (scanner 1 commit) → Docs (1 commit)，共 4 commits 跨 2 repos

---

*Plan written: 2026-04-26*
*Plan author: Claude (sonnet via Claude Code)*
*Spec source: `docs/superpowers/specs/2026-04-26-postmatch-other-section-design.md`*
