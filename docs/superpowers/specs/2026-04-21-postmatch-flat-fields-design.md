# PostMatch 扁平化欄位 — Design Spec

- **Date:** 2026-04-21
- **Status:** Approved (awaiting implementation plan)
- **Supersedes:** Phase 40 (`b12fe22` — split postmatch comments into 3 columns)

---

## 動機

Phase 40 把 PostMatch 序列化成三個文字欄（`robotIssues` / `performance` / `comments`），雖然比原先單欄乾淨，但 Google Sheets 分析時仍需在字串中做 `SEARCH` 才能統計單一 issue/flag 的發生率。改成「每個 issue/flag/collision boolean 一欄 0/1、每個 rating 一欄文字」後，`COUNTIF(B:B, 1)` 一式就能算出「這支隊伍幾場掉電壓」，大幅簡化分析工作流程。

同時順手清掉 Phase 39 保留的 3 個永遠 `false` 的舊布林欄位 (`robotDied` / `almostTipped` / `ridingOnBall`) — 反正已經在做 breaking change，一次清乾淨。

---

## Schema 變更

### 變更前（23 欄，自 Phase 40）

```
前 17 欄（PreMatch/Auto/Teleop/Penalty/Climb）保持不變
...
// 廢棄但保留（永遠 false）
robotDied, almostTipped, ridingOnBall,
// 彙總文字欄
robotIssues, performance, comments
```

### 變更後（44 欄）

**前 17 欄完全不動**（PreMatch/Auto/Teleop/Penalty/Climb），所以既有 Google Sheets 的左半邊資料列位置不偏移。

**後 27 欄全部重建：**

```
// Issues (11) — 0/1
issueNoShow, issueCrashed, issueEStop, issueAStop, issueLowVoltage,
issueIntakeStuck, issueShooterOff, issueStuckBump, issueHitTrench,
issuePartFell, issueMovement,

// Flags (6) — 0/1
flagYellowCard, flagRedCard, flagBelowExpected, flagTipped,
flagRidingFuel, flagStuckBall,

// Collision (4) — 前 3 欄 0/1，最後 1 欄文字
hasCollision, collisionField, collisionRobot,
collisionTeamNumbers,

// Ratings (5) — 文字 (good / ok / bad / 空)
ratingPushTrench, ratingPushBump, ratingShoot, ratingHuman, ratingDefense,

// Free-text (1)
comments
```

### 輸出格式

| 欄位類型 | TSV 輸出 |
|---------|---------|
| `issue*` / `flag*` / `hasCollision` / `collisionField` / `collisionRobot` | `1` when true, `0` when false |
| `rating*` | `good` / `ok` / `bad`；未評分輸出空字串（比照 `formatTextField` 既有慣例） |
| `collisionTeamNumbers` | 使用者輸入的原文字；未填輸出空字串 |
| `comments` | `postMatchChecklist.extraComments` 的 free-text；未填輸出空字串 |

---

## 架構設計

### 單一資料來源

UI 仍使用 `postMatchChecklist: PostMatchChecklist` 物件 — chip toggle、collapsible section、segmented rating 等 UI 狀態不變。型別保留不動。

**每次 checklist 變動時，`updateChecklist` 在單一 `update()` 呼叫內同時覆寫 26 個新增的扁平欄位**（延續 Phase 40 建立的「同一 `update()` 同步多欄」pattern，避免欄位脫節）。

### 新增 Serializer

`FRC/utils/checklistSerializer.ts`：

- **刪除**：`serializeIssues()` / `serializePerformance()` / `serializeComments()`
- **新增**：`checklistToFlatFields(c: PostMatchChecklist): Partial<ScoutingData>` — 回傳一個物件，key 是 26 個新扁平欄位名，值是對應的布林 (`0`/`1` 先以 `boolean` 形式儲存於 `ScoutingData`，TSV 輸出時由 `formatTextField` 轉字串) / 文字
- **保留**：`ISSUE_KEYS` / `FLAG_KEYS` / `RATING_ROW_KEYS` / `RATING_VALUES` / `toggleInArray()` — UI 仍需要

### TSV 產生

`FRC/services/googleSheets.ts` 的 `formatTextField` 擴充：

- 若欄位值為 `boolean`：輸出 `'1'` 或 `'0'`
- 若欄位值為 `string`：沿用現有邏輯（空字串/None 處理）
- 若欄位值為 `number`：沿用現有邏輯

---

## 修改檔案

| 檔案 | 改動摘要 |
|------|---------|
| `FRC/constants.ts` | `TSV_SCHEMA_MATCH` 23 → 44 欄；移除 `robotDied` / `almostTipped` / `ridingOnBall` / `robotIssues` / `performance`；新增 26 個扁平欄位；`comments` 沿用 |
| `FRC/types.ts` | `ScoutingData`：移除 5 個舊 key、新增 26 個新 key（布林/字串）；`INITIAL_DATA` 同步；`PostMatchChecklist` 型別不變 |
| `FRC/utils/checklistSerializer.ts` | 刪除 3 個舊 serializer；新增 `checklistToFlatFields()` |
| `FRC/components/TabViews.tsx` | `PostMatchTab.updateChecklist` 改為 `update({ postMatchChecklist: next, ...checklistToFlatFields(next) })` |
| `FRC/services/googleSheets.ts` | `formatTextField` 擴充布林處理；TSV 與 Apps Script payload 同步 |
| scanner repo `Code.gs` | 標頭 44 欄；部署後手動 `?action=fixHeaders` |

---

## 遷移策略

### 部署順序

1. 前端 `npm run build` 通過
2. 本機瀏覽器端對端測試（完整跑一輪 + 匯出 TSV 驗證）
3. Push `main` → Vercel 自動部署
4. scanner repo `Code.gs` 改 44 欄標頭 → 部署新版本
5. 瀏覽器開 `<googleScriptUrl>?action=fixHeaders` 手動升級既有 Sheet 標頭
6. Scanner 掃 QR 端對端驗證新欄位寫入正確

### 向下相容

- **舊 localStorage 記錄**：沒有 26 個新欄位，載入時 fallback 為 `false` / 空字串；匯出仍可產出合法 44 欄 TSV（後段全 `0`/空）
- **既有 Google Sheets 資料列**：前 17 欄位置不變；後 27 欄對舊列而言為空格 —— 這是正常的
- **`postMatchChecklist` 物件**：型別與結構不變，UI 操作無感

---

## 驗證清單

- [ ] `npm run build` 無 TS error
- [ ] PostMatchTab 所有 chip 可勾可取消，collision 文字輸入正常
- [ ] 匯出 TSV 欄位數 = 44
- [ ] 至少勾一組 issue/flag，TSV 對應欄位為 `1`；未勾的為 `0`
- [ ] Rating 選 good/ok/bad 後，TSV 對應欄位輸出對應英文字
- [ ] Collision toggle 關掉後，3 個 collision 布林欄全 `0`、`collisionTeamNumbers` 為空
- [ ] 載入 Phase 38/40 時代的舊 match record 不 crash，匯出時新欄位全 `0`/空

---

## Out of Scope（YAGNI）

- **UI 不改**：collapsible sections、chip toggle、segmented rating 全部保留
- **QR code 格式不改**：Match QR 仍是整個 TSV row（只是從 23 欄變 44 欄）
- **不自動遷移** Google Sheets 舊資料列（後 27 欄維持空即可，不追溯填 0）
- **不動 HistoryEditForm.tsx**：checklist UI 編輯時 `updateChecklist` 會自動同步扁平欄位
