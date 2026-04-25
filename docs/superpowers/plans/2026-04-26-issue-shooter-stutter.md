# 新增 issueShooterStutter Issue 欄位 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Scouting PASS + Scanner 兩個 repo 新增 `issueShooterStutter`（射球不順）issue 欄位，TSV schema 47 → 48 欄，版本 v1.7.0 → v1.8.0。

**Architecture:** Schema-driven — 改 schema 常數 + i18n + 跨 repo 三處鏡像，UI 自動渲染新 chip。本次僅新增 1 個 boolean 欄位，無 text 欄位變動，故 `PRESERVE_EMPTY_KEYS` 與 `checklistToFlatFields` 流程不需修改（既有架構自動支援）。

**Tech Stack:** TypeScript / React 18 / Vite 5 / Tailwind / Google Apps Script

**注意：** 本專案無 Jest/Vitest 測試套件（`package.json` 無 test script）。採「TypeScript 編譯驗證 + dev server 手動驗證 + 程式化 schema diff 驗證」三層替代方案。

---

## File Structure

### 主 repo (`D:\FRC\frc-6998-scouting-pass\FRC`)
| 檔案 | 責任 |
|------|------|
| `constants.ts` | TSV_SCHEMA_MATCH 常數定義（單一事實來源） |
| `types.ts` | `ScoutingData` 介面 + `INITIAL_DATA` 預設值 |
| `utils/checklistSerializer.ts` | `ISSUE_KEYS` 常數陣列 + `ISSUE_FIELD_MAP` 對應表 |
| `contexts/LanguageContext.tsx` | i18n EN/ZH 字典 |

### Scanner repo (`D:\FRC\frc-scout-scanner`)
| 檔案 | 責任 |
|------|------|
| `google-apps-script/Code.gs` | GAS 後端 TSV_SCHEMA_MATCH + 版本字串 + 寫 Sheets |
| `src/constants/schema.ts` | Scanner 前端 TSV_SCHEMA_MATCH + FIELD_LABELS（CN）|
| `src/utils/decoder.ts` | `detectQRType` 用 `.length` 動態比對（**僅需改註解**）|
| `src/i18n/locales/en.ts` | Scanner UI 英文 fields 字典 |
| `src/i18n/locales/zh-TW.ts` | Scanner UI 繁中 fields 字典 |

---

## Phase A — 主 repo 修改

### Task 1: 主 repo `constants.ts` — TSV_SCHEMA_MATCH 加 issueShooterStutter

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\constants.ts:39-65`

- [ ] **Step 1.1: 讀取目前 `constants.ts` 確認 anchor 行存在**

```bash
grep -n "issueShooterOff" D:/FRC/frc-6998-scouting-pass/FRC/constants.ts
```
Expected output: `53:  'issueIntakeStuck', 'issueShooterOff', 'issueStuckBump', 'issueHitTrench',`

- [ ] **Step 1.2: 用 Edit tool 在 `issueShooterOff` 後插入 `issueShooterStutter`**

old_string:
```typescript
  'issueIntakeStuck', 'issueShooterOff', 'issueStuckBump', 'issueHitTrench',
```

new_string:
```typescript
  'issueIntakeStuck', 'issueShooterOff', 'issueShooterStutter', 'issueStuckBump', 'issueHitTrench',
```

- [ ] **Step 1.3: 更新檔頭版本註解（v1.7.0 → v1.8.0）**

old_string:
```typescript
// v1.7.0 (2026-04-21): 44 → 47 columns. Add 3 fuel-action ratings
// (ratingIntakeFuel / ratingTransportFuel / ratingShootFuel) before `comments`.
export const TSV_SCHEMA_MATCH = [
```

new_string:
```typescript
// v1.7.0 (2026-04-21): 44 → 47 columns. Add 3 fuel-action ratings
// (ratingIntakeFuel / ratingTransportFuel / ratingShootFuel) before `comments`.
// v1.8.0 (2026-04-26): 47 → 48 columns. Add issueShooterStutter
// (射球不順 — 射到一半短暫卡頓後恢復) inserted after issueShooterOff.
export const TSV_SCHEMA_MATCH = [
```

- [ ] **Step 1.4: 驗證**

```bash
grep -n "issueShooterStutter\|issueShooterOff" D:/FRC/frc-6998-scouting-pass/FRC/constants.ts
```
Expected: 兩個 issue keys 同時出現在同一行（line 53）

---

### Task 2: 主 repo `types.ts` — ScoutingData + INITIAL_DATA 同步

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\types.ts:108-120` (interface)
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\types.ts:194-205` (INITIAL_DATA)

- [ ] **Step 2.1: 找 `issueShooterOff` 在介面位置**

```bash
grep -n "issueShooterOff" D:/FRC/frc-6998-scouting-pass/FRC/types.ts
```
Expected: 兩行（介面 + INITIAL_DATA）

- [ ] **Step 2.2: 在 `ScoutingData` 介面加 `issueShooterStutter: boolean`**

old_string:
```typescript
  issueIntakeStuck: boolean;
  issueShooterOff: boolean;
  issueStuckBump: boolean;
```

new_string:
```typescript
  issueIntakeStuck: boolean;
  issueShooterOff: boolean;
  issueShooterStutter: boolean;
  issueStuckBump: boolean;
```

- [ ] **Step 2.3: 更新註解 `// PostMatch Issues (11)` → `(12)`**

old_string:
```typescript
  // --- PostMatch (Flat Fields, mirrored from postMatchChecklist) ---
  // PostMatch Issues (11)
```

new_string:
```typescript
  // --- PostMatch (Flat Fields, mirrored from postMatchChecklist) ---
  // PostMatch Issues (12)
```

- [ ] **Step 2.4: 在 `INITIAL_DATA` 加 `issueShooterStutter: false`**

old_string:
```typescript
  issueIntakeStuck: false,
  issueShooterOff: false,
  issueStuckBump: false,
```

new_string:
```typescript
  issueIntakeStuck: false,
  issueShooterOff: false,
  issueShooterStutter: false,
  issueStuckBump: false,
```

- [ ] **Step 2.5: 驗證**

```bash
grep -c "issueShooterStutter" D:/FRC/frc-6998-scouting-pass/FRC/types.ts
```
Expected: `2`（介面 1 + INITIAL_DATA 1）

---

### Task 3: 主 repo `utils/checklistSerializer.ts` — ISSUE_KEYS + ISSUE_FIELD_MAP

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\utils\checklistSerializer.ts:8-20` (ISSUE_KEYS)
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\utils\checklistSerializer.ts:57-69` (ISSUE_FIELD_MAP)

- [ ] **Step 3.1: 在 `ISSUE_KEYS` 加 `'shooterStutter'`**

old_string:
```typescript
  'intakeStuck',
  'shooterOff',
  'stuckBump',
```

new_string:
```typescript
  'intakeStuck',
  'shooterOff',
  'shooterStutter',
  'stuckBump',
```

- [ ] **Step 3.2: 在 `ISSUE_FIELD_MAP` 加 mapping**

old_string:
```typescript
  intakeStuck:  'issueIntakeStuck',
  shooterOff:   'issueShooterOff',
  stuckBump:    'issueStuckBump',
```

new_string:
```typescript
  intakeStuck:    'issueIntakeStuck',
  shooterOff:     'issueShooterOff',
  shooterStutter: 'issueShooterStutter',
  stuckBump:      'issueStuckBump',
```

- [ ] **Step 3.3: 驗證**

```bash
grep -c "shooterStutter\|ShooterStutter" D:/FRC/frc-6998-scouting-pass/FRC/utils/checklistSerializer.ts
```
Expected: `2`（ISSUE_KEYS 1 + ISSUE_FIELD_MAP 1）

---

### Task 4: 主 repo `contexts/LanguageContext.tsx` — i18n EN + ZH

**Files:**
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\contexts\LanguageContext.tsx:62-64` (EN issues)
- Modify: `D:\FRC\frc-6998-scouting-pass\FRC\contexts\LanguageContext.tsx:253-255` (ZH issues)

- [ ] **Step 4.1: 加 EN label**

old_string:
```typescript
    issue_intakeStuck: "Intake not picking up",
    issue_shooterOff: "Shooter inaccurate",
    issue_stuckBump: "Stuck on bump",
```

new_string:
```typescript
    issue_intakeStuck: "Intake not picking up",
    issue_shooterOff: "Shooter inaccurate",
    issue_shooterStutter: "Shooter stutters",
    issue_stuckBump: "Stuck on bump",
```

- [ ] **Step 4.2: 加 ZH label**

old_string:
```typescript
    issue_intakeStuck: "intake 吸不起來",
    issue_shooterOff: "shooter 不準",
    issue_stuckBump: "過 bump 會卡住",
```

new_string:
```typescript
    issue_intakeStuck: "intake 吸不起來",
    issue_shooterOff: "shooter 不準",
    issue_shooterStutter: "射球不順",
    issue_stuckBump: "過 bump 會卡住",
```

- [ ] **Step 4.3: 驗證 EN + ZH 都加了**

```bash
grep -c "issue_shooterStutter" D:/FRC/frc-6998-scouting-pass/FRC/contexts/LanguageContext.tsx
```
Expected: `2`

---

### Task 5: 主 repo — TypeScript 編譯驗證

- [ ] **Step 5.1: 執行 `npm run build`**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run build
```

Expected: `✓ built in <time>` 無 TS error。

**若失敗：** 對照錯誤訊息修正。常見問題：
- `Property 'issueShooterStutter' is missing in type 'ScoutingData'` → Task 2 沒做完，回去補 INITIAL_DATA
- `Type '"shooterStutter"' is not assignable to type 'IssueKey'` → Task 3 沒做完，補 ISSUE_KEYS

---

### Task 6: 主 repo — Dev server 手動驗證

- [ ] **Step 6.1: 啟動 dev server**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC" && npm run dev
```

Expected: `Local: http://localhost:5173/`

- [ ] **Step 6.2: 瀏覽器手動驗證 PostMatch chip**

操作：
1. 打開 `http://localhost:5173/`
2. 跳到 PostMatch tab
3. 展開「Robot Issues」section
4. 確認看到第 12 個 chip「射球不順」（中文界面）/ "Shooter stutters"（英文界面）
5. 點擊 chip → 變成啟用狀態（顏色變化）
6. Header 應顯示「Robot Issues」啟用數量 +1

- [ ] **Step 6.3: 驗證 TSV 輸出**

操作：
1. 填完最低必要欄位（teamNumber、scouter 等）+ 勾「射球不順」
2. 跳到 QR Code tab
3. 點 "Show Data Labels" 或 "Raw TSV"
4. 確認看到 `issueShooterStutter\t1` 在 issue 欄位群中
5. 確認總欄位數為 48（可從 raw TSV `\t` 計數驗證 — 47 個 tab 對應 48 個欄位）

- [ ] **Step 6.4: 停止 dev server (Ctrl+C)**

---

### Task 7: 主 repo — Commit + push

- [ ] **Step 7.1: 確認 git status**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC" && git status --short
```

Expected: 4 個 modified（M）：`constants.ts`, `types.ts`, `utils/checklistSerializer.ts`, `contexts/LanguageContext.tsx`，加 1 個 untracked（??）：`docs/superpowers/specs/2026-04-26-issue-shooter-stutter-design.md` + 1 個 plan 文件 `docs/superpowers/plans/2026-04-26-issue-shooter-stutter.md`

- [ ] **Step 7.2: Stage 修改的檔案**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC" && git add constants.ts types.ts utils/checklistSerializer.ts contexts/LanguageContext.tsx docs/superpowers/specs/2026-04-26-issue-shooter-stutter-design.md docs/superpowers/plans/2026-04-26-issue-shooter-stutter.md
```

- [ ] **Step 7.3: Commit**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC" && git commit -m "$(cat <<'EOF'
feat(schema): add issueShooterStutter (47 -> 48 columns)

新增第 12 個 PostMatch issue chip「射球不順」(Shooter stutters)，
表示射球過程中短暫卡頓又恢復的狀況，與既有 issueShooterOff
(label 為「shooter 不準」) 區分。

主 repo 修改：
- constants.ts: TSV_SCHEMA_MATCH 47 -> 48
- types.ts: ScoutingData + INITIAL_DATA 加 issueShooterStutter
- utils/checklistSerializer.ts: ISSUE_KEYS + ISSUE_FIELD_MAP
- contexts/LanguageContext.tsx: EN + ZH label
- docs: 設計 spec + 實作 plan

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 7.4: Push**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC" && git push origin main
```

Expected: `* [new branch]` or `<old>..<new>  main -> main`

- [ ] **Step 7.5: 標 Task #3 + #4 為 completed**

---

## Phase B — Scanner repo 修改（三處鏡像 + i18n）

### Task 8: Scanner — `google-apps-script/Code.gs`

**Files:**
- Modify: `D:\FRC\frc-scout-scanner\google-apps-script\Code.gs:53-110` (TSV_SCHEMA_MATCH)
- Modify: `D:\FRC\frc-scout-scanner\google-apps-script\Code.gs:203` (version string)

- [ ] **Step 8.1: 確認既有結構**

```bash
grep -n "issueShooterOff\|version: '1\\." D:/FRC/frc-scout-scanner/google-apps-script/Code.gs
```

Expected: 兩處（schema 一行 + version 一行）

- [ ] **Step 8.2: 在 `TSV_SCHEMA_MATCH` 加 `issueShooterStutter`**

old_string:
```javascript
  'issueShooterOff',      // 23: Shooter 異常
```

new_string:
```javascript
  'issueShooterOff',      // 23: Shooter 異常
  'issueShooterStutter',  // 24: 射球不順 (v1.8.0)
```

⚠️ **注意：** 這個變更會讓後續欄位編號註解都偏移。本步只插新欄位，後續編號不修正（避免大量無功能變動的 noise commit）。實際使用時 `TSV_SCHEMA_MATCH.indexOf()` 動態取索引，註解編號僅供閱讀參考。

- [ ] **Step 8.3: 更新版本字串**

old_string:
```javascript
    version: '1.7.0',
```

new_string:
```javascript
    version: '1.8.0',
```

- [ ] **Step 8.4: 更新檔頭版本變更註解**

```bash
grep -n "v1.7.0 變更" D:/FRC/frc-scout-scanner/google-apps-script/Code.gs
```

讀取該行附近 10 行 context，在「v1.7.0 變更:」block **之後**新增一個 block：
```
 * v1.8.0 變更 (2026-04-26):
 *   - TSV_SCHEMA_MATCH 47 → 48 欄
 *   - 新增 issueShooterStutter (射球不順) 插在 issueShooterOff 後
```

(實際 Edit 操作：在現有 v1.7.0 註解 block 結尾的下一個空白行前插入此 block。具體 anchor 視當下檔案內容調整。)

- [ ] **Step 8.5: 驗證**

```bash
grep -c "issueShooterStutter\|1.8.0" D:/FRC/frc-scout-scanner/google-apps-script/Code.gs
```

Expected: 至少 `3`（schema 1 + version 1 + 註解 ≥1）

---

### Task 9: Scanner — `src/constants/schema.ts`

**Files:**
- Modify: `D:\FRC\frc-scout-scanner\src\constants\schema.ts:34-45` (TSV_SCHEMA_MATCH)
- Modify: `D:\FRC\frc-scout-scanner\src\constants\schema.ts:218-229` (FIELD_LABELS)

- [ ] **Step 9.1: 在 TSV_SCHEMA_MATCH 加 issueShooterStutter**

old_string:
```typescript
  'issueIntakeStuck',
  'issueShooterOff',
  'issueStuckBump',
```

new_string:
```typescript
  'issueIntakeStuck',
  'issueShooterOff',
  'issueShooterStutter',
  'issueStuckBump',
```

- [ ] **Step 9.2: 在 FIELD_LABELS（簡中）加對應**

old_string:
```typescript
  issueIntakeStuck: 'Intake 卡住',
  issueShooterOff: 'Shooter 异常',
  issueStuckBump: '卡在 Bump 上',
```

new_string:
```typescript
  issueIntakeStuck: 'Intake 卡住',
  issueShooterOff: 'Shooter 异常',
  issueShooterStutter: '射球不顺',
  issueStuckBump: '卡在 Bump 上',
```

- [ ] **Step 9.3: 驗證**

```bash
grep -c "issueShooterStutter" D:/FRC/frc-scout-scanner/src/constants/schema.ts
```

Expected: `2`

---

### Task 10: Scanner — `src/utils/decoder.ts`（僅更新註解）

**Files:**
- Modify: `D:\FRC\frc-scout-scanner\src\utils\decoder.ts:29-30` (註解)

⚠️ **重要：** `detectQRType` 已用 `TSV_SCHEMA_MATCH.length` **動態比對**（line 30），不是硬編碼 47。schema.ts 改完後此處邏輯**自動跟上**。本 task 僅更新註解避免誤導讀者。

- [ ] **Step 10.1: 更新註解**

old_string:
```typescript
  // v1.7.0: match 已擴充到 47 欄，不再與 pit-external 衝突。
  if (length === TSV_SCHEMA_MATCH.length) return 'match';                       // 47 (v1.7.0)
```

new_string:
```typescript
  // v1.8.0: match 已擴充到 48 欄，不再與 pit-external 衝突。
  if (length === TSV_SCHEMA_MATCH.length) return 'match';                       // 48 (v1.8.0)
```

- [ ] **Step 10.2: 驗證**

```bash
grep -n "v1.8.0\|48" D:/FRC/frc-scout-scanner/src/utils/decoder.ts
```

Expected: 看到「48 (v1.8.0)」註解

---

### Task 11: Scanner — `src/i18n/locales/en.ts`

**Files:**
- Modify: `D:\FRC\frc-scout-scanner\src\i18n\locales\en.ts:205-208` (fields.issueShooter*)

- [ ] **Step 11.1: 找定錨點**

```bash
grep -n "issueShooterOff\|issueIntakeStuck" D:/FRC/frc-scout-scanner/src/i18n/locales/en.ts
```

Expected: 兩個 lines 連續

- [ ] **Step 11.2: 加 `issueShooterStutter` 進 fields 字典**

old_string:
```typescript
    issueShooterOff: 'Shooter Off',
```

new_string:
```typescript
    issueShooterOff: 'Shooter Off',
    issueShooterStutter: 'Shooter stutters',
```

- [ ] **Step 11.3: 驗證**

```bash
grep -c "issueShooterStutter" D:/FRC/frc-scout-scanner/src/i18n/locales/en.ts
```

Expected: `1`

---

### Task 12: Scanner — `src/i18n/locales/zh-TW.ts`

**Files:**
- Modify: `D:\FRC\frc-scout-scanner\src\i18n\locales\zh-TW.ts:203-206` (fields.issueShooter*)

- [ ] **Step 12.1: 加 `issueShooterStutter` 進 fields 字典**

old_string:
```typescript
    issueShooterOff: 'Shooter 異常',
```

new_string:
```typescript
    issueShooterOff: 'Shooter 異常',
    issueShooterStutter: '射球不順',
```

- [ ] **Step 12.2: 驗證**

```bash
grep -c "issueShooterStutter" D:/FRC/frc-scout-scanner/src/i18n/locales/zh-TW.ts
```

Expected: `1`

---

### Task 13: Scanner — TypeScript build 驗證

- [ ] **Step 13.1: 執行 build**

```bash
cd "D:/FRC/frc-scout-scanner" && npm run build
```

Expected: `✓ built in <time>` 無 TS error。

---

### Task 14: Scanner — 程式化驗證三方 schema 一致

確保主 repo `constants.ts`、scanner `Code.gs`、scanner `src/constants/schema.ts` 三方 `TSV_SCHEMA_MATCH` 完全相同（48 欄、順序一致、key 拼字一致）。

- [ ] **Step 14.1: 執行驗證腳本**

```bash
node -e "
const fs = require('fs');
const extract = path => {
  const text = fs.readFileSync(path, 'utf-8');
  const m = text.match(/TSV_SCHEMA_MATCH\s*=\s*\[([\s\S]*?)\]/);
  if (!m) throw new Error('No TSV_SCHEMA_MATCH in ' + path);
  return [...m[1].matchAll(/'([a-zA-Z][\w]*)'/g)].map(x => x[1]);
};
const a = extract('D:/FRC/frc-6998-scouting-pass/FRC/constants.ts');
const b = extract('D:/FRC/frc-scout-scanner/google-apps-script/Code.gs');
const c = extract('D:/FRC/frc-scout-scanner/src/constants/schema.ts');
console.log('main length:', a.length, 'gas length:', b.length, 'scanner length:', c.length);
console.log('main vs gas:', JSON.stringify(a) === JSON.stringify(b) ? 'OK' : 'DIFF');
console.log('main vs scanner:', JSON.stringify(a) === JSON.stringify(c) ? 'OK' : 'DIFF');
if (JSON.stringify(a) !== JSON.stringify(b)) {
  console.log('main extras:', a.filter(x => !b.includes(x)));
  console.log('gas extras:', b.filter(x => !a.includes(x)));
}
if (JSON.stringify(a) !== JSON.stringify(c)) {
  console.log('main extras (vs scanner):', a.filter(x => !c.includes(x)));
  console.log('scanner extras:', c.filter(x => !a.includes(x)));
}
"
```

Expected:
```
main length: 48 gas length: 48 scanner length: 48
main vs gas: OK
main vs scanner: OK
```

**若任一為 DIFF：** 對照 `extras` 輸出修補不一致。**不能跳過此 step**（這正是上次踩坑點）。

---

### Task 15: Scanner — Commit + push

- [ ] **Step 15.1: 確認 scanner git status**

```bash
cd "D:/FRC/frc-scout-scanner" && git status --short
```

Expected: 5 個 modified（M）：`google-apps-script/Code.gs`, `src/constants/schema.ts`, `src/utils/decoder.ts`, `src/i18n/locales/en.ts`, `src/i18n/locales/zh-TW.ts`

- [ ] **Step 15.2: Stage + Commit**

```bash
cd "D:/FRC/frc-scout-scanner" && git add google-apps-script/Code.gs src/constants/schema.ts src/utils/decoder.ts src/i18n/locales/en.ts src/i18n/locales/zh-TW.ts
```

```bash
cd "D:/FRC/frc-scout-scanner" && git commit -m "$(cat <<'EOF'
feat(schema): sync to v1.8.0 (47 -> 48 columns)

配合 Scouting PASS v1.8.0：新增 issueShooterStutter (射球不順)
插在 issueShooterOff 後。三處鏡像 + i18n 全部同步：

- google-apps-script/Code.gs: TSV_SCHEMA_MATCH + version 1.8.0
- src/constants/schema.ts: TSV_SCHEMA_MATCH + FIELD_LABELS
- src/utils/decoder.ts: 註解 47 -> 48（detectQRType 動態 .length 比對）
- src/i18n/locales/{en,zh-TW}.ts: fields.issueShooterStutter

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 15.3: Push**

```bash
cd "D:/FRC/frc-scout-scanner" && git push origin main
```

- [ ] **Step 15.4: 標 Task #5 + #6 為 completed**

---

## Phase C — 收尾

### Task 16: 用 `/finish` 更新 PROGRESS.md / FINDINGS.md / CLAUDE.md

- [ ] **Step 16.1: 執行 `/finish` slash command**

或手動更新：
- `PROGRESS.md`：新增 Session 2026-04-26 紀錄 Phase 46（issueShooterStutter）+ 5-Question Reboot Check
- `CLAUDE.md`：把 v1.7.0 (47) 字樣更新為 v1.8.0 (48)；issue 群組從 11 改為 12
- `FINDINGS.md`（可選）：紀錄「`detectQRType` 用 `.length` 動態比對，schema 改完自動跟上」此一架構觀察

- [ ] **Step 16.2: Commit + push 文件更新**

```bash
cd "D:/FRC/frc-6998-scouting-pass/FRC" && git add PROGRESS.md CLAUDE.md && git commit -m "docs: update progress/claude for v1.8.0 (issueShooterStutter)" && git push origin main
```

---

## Phase D — 使用者手動部署（不在本 plan 自動執行範圍）

⚠️ **下列步驟必須由使用者手動執行**（GAS 無法用 git push 部署）：

1. **GAS 部署：** 把 scanner repo 的 `google-apps-script/Code.gs` 內容覆貼到 Google Apps Script project → 「部署 → 管理部署作業 → 編輯 → 新版本 → 部署」
2. **Sheet 標頭升級：** 對每個活躍的 Google Sheet（webApp URL 後面）GET `<webAppUrl>?action=fixHeaders` 把標頭從 47 → 48 欄
3. **端對端驗證：**
   - Scouting PASS：填一筆完整資料（勾「射球不順」）→ QR
   - Scanner：掃 Match QR → 應顯示 48 欄解碼成功（不再 fallback 到 unknown）
   - Match + Path 配對 → 按上傳 → Sheet 出現新一列含 `issueShooterStutter` = 1

---

## Self-Review 結果

### 1. Spec coverage
- ✅ 命名 `issueShooterStutter` / 「射球不順」/ "Shooter stutters" → Tasks 1-4, 8-12
- ✅ Schema 47 → 48，插在 `issueShooterOff` 後 → Tasks 1, 8, 9
- ✅ 主 repo 4 檔修改 → Tasks 1-4
- ✅ Scanner repo 5 檔修改 → Tasks 8-12
- ✅ 上次踩坑對照（三處鏡像 + i18n + fixHeaders）→ Tasks 8-12, 14, Phase D
- ✅ 部署順序 → Phase A → Phase B → Phase C → Phase D
- ✅ 程式化驗證三方 schema 一致 → Task 14
- ✅ 完成驗收條件 → 各 Task 步驟內含驗證指令

### 2. Placeholder scan
- 無 TBD / TODO / 「Add appropriate error handling」等占位
- 所有 Edit 的 old_string / new_string 是實際程式碼
- 所有驗證指令是可執行的 grep / node / npm 命令

### 3. Type / 命名一致性
- `issueShooterStutter` (camelCase TSV key) — 整篇統一
- `'shooterStutter'` (內部 IssueKey) — 整篇統一
- 「射球不順」(ZH) / "Shooter stutters" (EN) — 整篇統一
- v1.7.0 → v1.8.0 — 整篇統一
- 47 → 48 — 整篇統一

### 4. 風險檢查
- ⚠️ 既有 history record 沒有 `issueShooterStutter` 欄位 → JSON 反序列化後為 `undefined` → 在 PostMatchTab 表現上等同 `false`（chip 未啟用），無破壞行為
- ⚠️ 部署過渡期：使用者用舊版 Scouting PASS（47 欄 QR）掃新版 scanner（期待 48）會被判為 `unknown` → 緩解：使用者強制 reload 拿 Vercel 最新版

---

*Plan saved: 2026-04-26*
