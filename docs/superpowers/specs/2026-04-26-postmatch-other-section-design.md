# PostMatch「其他」區段 + Teleop 三欄移除 + flag_stuckBall label 改名 (v1.9.0)

**Date:** 2026-04-26
**Status:** Approved (brainstorming complete)
**Schema Version:** v1.8.0 → v1.9.0
**Schema Total:** 48 columns → 48 columns (移 3、加 3、改 1 個 label，總數不變但結構大改)

---

## 1. 動機與背景

使用者要求三件事：

1. **PostMatch 新增「其他」區段** — 觀察隊伍在賽後對 alliance zone 球量需求、偷球行為、defense 對射球影響的策略觀察
   - 偷球：boolean toggle（會/不會）
   - 需要球：3 級 rating（不需要/普通/很需要）
   - 被 defense 影響：3 級 rating（還好/普通/嚴重）
2. **Teleop 移除 3 個 Counter** — 穿越 Bump/Trench 計數欄位實際 scouting 中不再使用
3. **flag_stuckBall label 改名** — 2026 賽季統一稱 fuel 不稱 ball，但只改 UI label，TSV column key 維持

本次同時觸發三方 schema mirror（main / google-apps-script / scanner）的全鏈同步，並用程式化驗證防範前次（v1.8.0）整理的踩坑清單。

---

## 2. 變動總覽

| 類別 | 動作 | 欄位 / 細節 |
|------|------|--------------|
| Teleop | 移除 3 欄 | `bumpCount` (idx 9), `trenchCount` (idx 10), `fuelDroppedOnBumpCount` (idx 11) |
| PostMatch | 新增 3 欄 | `otherStealsOpponent` (boolean), `ratingNeedFuel` (rating), `ratingShotUnderDefense` (rating) |
| i18n | 改 1 個 label | `flag_stuckBall`：EN "Stuck on ball" → "Stuck on fuel"；ZH「卡在球上」→「卡在 fuel 上」（key 不動） |
| TSV column 命名 | 不重命名 | `flagStuckBall` schema column key 維持原樣，避免破壞既有 sheet 既有欄位 |

**淨欄位數：48 → 48**（總數巧合不變，但 column 順序與內容大改 → `fixHeaders` 必跑）

---

## 3. Schema 變動（`constants.ts`）

### 移除（idx 9-11）
```ts
'bumpCount', 'trenchCount', 'fuelDroppedOnBumpCount',
```

### 新增（在 `comments` 之前）
```ts
... ratingShootFuel,
// PostMatch「其他」區段 (3) — v1.9.0
'otherStealsOpponent',     // boolean: 0/1 — 去對方 alliance zone 偷球
'ratingNeedFuel',          // good/ok/bad — alliance zone 需要有球
'ratingShotUnderDefense',  // good/ok/bad — 被 defense 影響射球
'comments',                // 維持最後
```

### 完整 v1.9.0 TSV_SCHEMA_MATCH 結構（48 欄）

```
PreMatch (6):     scouterName, eventCode, matchLevel, matchNumber, alliance, teamNumber
Auto (3):         autoClimbStatus, autoClimbTime, autoClimbPosition
Penalty (2):      minorPenalty, majorPenalty
Climb (3):        teleClimbStatus, teleClimbTime, teleClimbPosition
                  ← 14 欄（前 14 欄不變，但因移除 Teleop 3 欄而往前推）
Issues (12):      issueNoShow, issueCrashed, issueEStop, issueAStop, issueLowVoltage,
                  issueIntakeStuck, issueShooterOff, issueShooterStutter,
                  issueStuckBump, issueHitTrench, issuePartFell, issueMovement
Flags (6):        flagYellowCard, flagRedCard, flagBelowExpected, flagTipped,
                  flagRidingFuel, flagStuckBall  ← key 不變
Collision (4):    hasCollision, collisionField, collisionRobot, collisionTeamNumbers
Ratings (8):      ratingPushTrench, ratingPushBump, ratingShoot, ratingHuman, ratingDefense,
                  ratingIntakeFuel, ratingTransportFuel, ratingShootFuel
Other (3):        otherStealsOpponent, ratingNeedFuel, ratingShotUnderDefense  ← 新增
Free-text (1):    comments

Total: 14 + 12 + 6 + 4 + 8 + 3 + 1 = 48 columns
```

**重要**：原 v1.8.0 前 17 欄包含 `bumpCount/trenchCount/fuelDroppedOnBumpCount`（idx 9-11）。v1.9.0 移除後，整體 column 順序往前位移 3 格 → 既有 sheet 既有欄位會錯位 → **`fixHeaders` 必跑**。

---

## 4. Type 變動（`types.ts`）

### `PostMatchChecklist` 擴展

```ts
interface PostMatchChecklist {
  issues: string[];
  flags: string[];

  hasCollision: boolean;
  collisionField: boolean;
  collisionRobot: boolean;
  collisionTeamNumbers: string;

  ratings: {
    pushTrench:    ChecklistRating;
    pushBump:      ChecklistRating;
    shoot:         ChecklistRating;
    human:         ChecklistRating;
    defense:       ChecklistRating;
    intakeFuel:    ChecklistRating;
    transportFuel: ChecklistRating;
    shootFuel:     ChecklistRating;
    needFuel:         ChecklistRating;  // 新增 — alliance zone 需要有球
    shotUnderDefense: ChecklistRating;  // 新增 — 被 defense 影響射球
  };

  // 新增「其他」boolean
  stealsOpponent: boolean;

  extraComments?: string;
}
```

### `ScoutingData` 變動

**移除：**
- `bumpCount: number`
- `trenchCount: number`
- `fuelDroppedOnBumpCount: number`

**新增：**
- `otherStealsOpponent: boolean`
- `ratingNeedFuel: ChecklistRating`
- `ratingShotUnderDefense: ChecklistRating`

### `INITIAL_DATA` 同步

- 移除三個 Teleop count 預設值
- 新增三個欄位預設：`otherStealsOpponent: false`, `ratingNeedFuel: ''`, `ratingShotUnderDefense: ''`
- `INITIAL_DATA.postMatchChecklist` 內：
  - `stealsOpponent: false`
  - `ratings.needFuel: ''`
  - `ratings.shotUnderDefense: ''`

---

## 5. UI 變動

### 5.1 `components/TabViews.tsx` — Teleop 區段

**移除三個 Counter：**
- 「穿越 Bump 次數」（bumpCount）
- 「穿越 Trench 次數」（trenchCount）
- 「穿越 Bump 時 Fuel 掉落」（fuelDroppedOnBumpCount）

Teleop 區段剩餘元件（teleClimbStatus / teleClimbTime / teleClimbPosition / minorPenalty / majorPenalty）保持不變。

### 5.2 PostMatchChecklist 元件 — 新增「其他」可摺疊區段

**位置**：「動作評分」區段之後、「自由備註」之前。

**結構**（沿用既有「點擊標題展開收合 + header 顯示啟用數量 badge」pattern）：

```
[▶ 其他 (n)]                            ← header + badge（n = 啟用數量：toggle on + 兩 rating 已選）
└─ ☑ 去對方 alliance zone 偷球            ← boolean toggle
└─ alliance zone 需要有球
   [不需要] [普通] [很需要]                ← 3-button rating row（per-row label）
└─ 被 defense 影響射球
   [還好] [普通] [嚴重]                    ← 3-button rating row（per-row label）
```

**實作要點**：
- Boolean toggle row 結構同既有 collision toggle（hasCollision）
- 兩 rating row 必須支援 **per-row 自訂三按鈕 label**（既有 RatingRow 元件使用「Good/OK/Bad」共用 label，這次需擴展支援 row-specific label override）
- Header 啟用數量 badge 計算：`(stealsOpponent ? 1 : 0) + (needFuel !== '' ? 1 : 0) + (shotUnderDefense !== '' ? 1 : 0)`

### 5.3 RatingRow 元件擴展（如需）

如果既有 RatingRow 元件 hardcode `'Good' / 'OK' / 'Bad'` label，本次需擴展：

```tsx
interface RatingRowProps {
  ...
  labels?: {  // 可選，未提供則用 i18n 預設 rating_value_*
    good: string;
    ok:   string;
    bad:  string;
  };
}
```

實作前先讀現有 RatingRow 元件確認當前 label 機制，再決定要 component-level prop 還是 i18n key per-row。

---

## 6. i18n 變動（`contexts/LanguageContext.tsx`）

### 修改 1 個（key 不動）

| Key | EN 舊 → 新 | ZH 舊 → 新 |
|-----|-----------|-----------|
| `flag_stuckBall` | "Stuck on ball" → **"Stuck on fuel"** | 「卡在球上」→ **「卡在 fuel 上」** |

### 新增 keys

**Section header：**
- `section_other`: "Other" / "其他"

**Boolean toggle：**
- `other_stealsOpponent`: "Steals fuel from opponent zone" / "去對方 alliance zone 偷球"

**Rating row labels：**
- `rating_needFuel`: "Need fuel in alliance zone" / "alliance zone 需要有球"
- `rating_shotUnderDefense`: "Shot accuracy under defense" / "被 defense 影響射球"

**Rating button labels（per-row 客製）：**
- `ratingNeedFuel_good`: "Don't need" / "不需要"
- `ratingNeedFuel_ok`:   "Normal" / "普通"
- `ratingNeedFuel_bad`:  "Need a lot" / "很需要"
- `ratingShotUnderDefense_good`: "Fine" / "還好"
- `ratingShotUnderDefense_ok`:   "Normal" / "普通"
- `ratingShotUnderDefense_bad`:  "Severe" / "嚴重"

---

## 7. 序列化（`utils/checklistSerializer.ts`）

### `RATING_ROW_KEYS` 擴展（8 → 10）

```ts
export const RATING_ROW_KEYS = [
  'pushTrench', 'pushBump', 'shoot', 'human', 'defense',
  'intakeFuel', 'transportFuel', 'shootFuel',
  'needFuel',          // 新增
  'shotUnderDefense',  // 新增
] as const;
```

### `RATING_FIELD_MAP` 對應

```ts
const RATING_FIELD_MAP: Record<RatingRow, keyof ScoutingData> = {
  // ...既有 8 個
  needFuel:         'ratingNeedFuel',
  shotUnderDefense: 'ratingShotUnderDefense',
};
```

### `checklistToFlatFields` 新增 boolean 處理

```ts
export function checklistToFlatFields(c: PostMatchChecklist): Partial<ScoutingData> {
  const out: Partial<ScoutingData> = {};
  // ...既有 issues / flags / collision / ratings 處理
  out.comments = (c.extraComments ?? '').trim();

  // 新增「其他」boolean
  out.otherStealsOpponent = c.stealsOpponent;

  return out;
}
```

`ratings.needFuel` 和 `ratings.shotUnderDefense` 透過 `RATING_ROW_KEYS` 迴圈自動處理，不需要手動加。

---

## 8. Sheets 序列化（`services/googleSheets.ts`）

### `PRESERVE_EMPTY_KEYS` 新增 2 個 rating

```ts
const PRESERVE_EMPTY_KEYS = new Set([
  // ...既有 ratings, comments, collisionTeamNumbers
  'ratingNeedFuel',          // 新增 — text 欄位空值要輸出 ''
  'ratingShotUnderDefense',  // 新增 — text 欄位空值要輸出 ''
]);
```

**不加 `otherStealsOpponent`** — boolean 欄位空值處理走 `'0'/'1'` 預設邏輯，不適用 PRESERVE_EMPTY_KEYS。

---

## 9. Scanner repo 同步（`D:\FRC\frc-scout-scanner` 三處鏡像 + i18n）

### 9.1 `google-apps-script/Code.gs`

- `TSV_SCHEMA_MATCH`：移 3 + 加 3，與主 repo 完全一致
- `version` 字串：`'1.8.0'` → `'1.9.0'`
- 欄位編號註解（// 17、// 18、...）全部更新到新順序

### 9.2 `src/constants/schema.ts`

- `TSV_SCHEMA_MATCH`：同上
- `FIELD_LABELS`：簡中翻譯
  - `flagStuckBall`: 「卡在球上」→「卡在 fuel 上」（key 不變，僅 label）
  - 移除 `bumpCount` / `trenchCount` / `fuelDroppedOnBumpCount` 三 label
  - 新增 `otherStealsOpponent` / `ratingNeedFuel` / `ratingShotUnderDefense` 簡中 label

### 9.3 `src/utils/decoder.ts`

- `detectQRType` 已用 `.length` 動態比對，邏輯不需改
- 註解 `// 48 columns` 更新（如果有寫死數字）

### 9.4 `src/i18n/locales/en.ts`

- `flag_stuckBall`: "Stuck on fuel"（從 "Stuck on ball"）
- 新增與主 repo 對應的 i18n keys（section_other, other_stealsOpponent, rating_needFuel, rating_shotUnderDefense + 6 個 per-row button labels）

### 9.5 `src/i18n/locales/zh-TW.ts`

- `flag_stuckBall`: "卡在 fuel 上"
- 新增對應 ZH keys

---

## 10. 部署順序 & 程式化驗證

| 步驟 | 動作 | 負責 |
|------|------|------|
| 1 | 主 repo: 改檔 → `npm run build` 通過 → commit/push | Claude |
| 2 | Scanner repo: 改檔 → `npm run build` 通過 → commit/push | Claude |
| 3 | 程式化驗證：main / gas / scanner schema length === 48；新 3 key idx 三方一致；移除 3 key 三方都不存在 | Claude |
| 4 | 使用者：把 scanner 最新 `Code.gs` 覆貼到 GAS project → 部署新版（內部版本字串 1.9.0） | User |
| 5 | 使用者：對每個活躍 Sheet GET `<webAppUrl>?action=fixHeaders` 升級到 v1.9.0 標頭（**本次因欄位順序變了必跑**） | User |
| 6 | 使用者：端對端 QR 掃描驗證 — 48 欄 Match QR 解碼成功 + 偷球/需要球/被 defense 三欄輸出正確（'1'/good/bad 等） | User |

### 程式化驗證腳本（防上次踩坑）

驗證輸出範本：
```
main length: 48 | gas length: 48 | scanner length: 48
main vs gas:     OK
main vs scanner: OK

removed (must NOT exist in any):
  bumpCount               main: ✗  gas: ✗  scanner: ✗  OK
  trenchCount             main: ✗  gas: ✗  scanner: ✗  OK
  fuelDroppedOnBumpCount  main: ✗  gas: ✗  scanner: ✗  OK

added (must exist at same idx):
  otherStealsOpponent     main idx: 45  gas: 45  scanner: 45  OK
  ratingNeedFuel          main idx: 46  gas: 46  scanner: 46  OK
  ratingShotUnderDefense  main idx: 47  gas: 47  scanner: 47  OK
```

---

## 11. 上次踩坑對照表（這次防範）

| 上次坑（v1.7.0 / v1.8.0 留下的教訓） | 這次處理 |
|--------------------------------------|----------|
| Scanner 三處鏡像（schema.ts / Code.gs / decoder.ts）漏同步 | ✅ 三處全改、加程式化驗證 |
| Scanner i18n locales 漏更新（en.ts / zh-TW.ts） | ✅ 兩 locale 都同步（含新 keys + flag_stuckBall label 改名） |
| 部署後忘記 fixHeaders 導致欄位錯位 | ✅ 寫進部署順序，本次因欄位順序大改**必跑** |
| `PRESERVE_EMPTY_KEYS` 漏新增 text 欄位 | ✅ 2 個新 rating 已列入清單 |
| `detectQRType` 長度比對寫死數字 | ✅ 已動態 `.length`（v1.8.0 前已修），僅需更新註解 |
| 移除欄位殘留 INITIAL_DATA / type 引用 | ✅ Plan 加 grep 全 repo 驗證步驟（搜 `bumpCount` / `trenchCount` / `fuelDroppedOnBumpCount` 確認 0 引用） |
| 新增 schema column 但忘了補 INITIAL_DATA 預設值 | ✅ Type 變動 section 已明確列出 INITIAL_DATA 同步要求 |

---

## 12. 命名決策附註

| 決策 | 選擇 | 原因 |
|------|------|------|
| 偷球題型別 | boolean toggle | 使用者選 C（vs 3 級評分） |
| 「其他」區段位置 | 獨立新區段，動作評分後 | 使用者選 A — 三題並列符合「其他」語意 |
| 兩 rating 內部值 | 沿用 `good/ok/bad` | 使用者選 A — 完全沿用既有元件 / PRESERVE_EMPTY_KEYS / Sheets 統計，cost 最低 |
| stuck on ball 改名範圍 | 僅改 i18n label（key 不動） | 使用者選 A — TSV column 名 `flagStuckBall` 保留，不破壞既有 sheet column key |
| 中文 label | 「卡在 fuel 上」 | 使用者選 (1) — 與原本「卡在球上」結構一致 |
| TSV column prefix | `other*`（boolean）+ `rating*`（rating） | mirror 既有 pattern（issue→issueXxx, flag→flagXxx），rating 維持 rating prefix |

---

*Spec written: 2026-04-26*
*Spec author: Claude (sonnet via Claude Code)*
*Approver: User*
