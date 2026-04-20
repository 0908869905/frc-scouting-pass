# PostMatch Comments 結構化勾選清單設計

- **日期**：2026-04-20
- **影響範圍**：`PostMatchTab` 的 comments 區塊
- **code.gs 變更**：不需要（TSV schema 欄位不變）

## 背景

現況：PostMatch 頁的 `comments` 是單一 textarea，scouter 自由打字。問題是內容散亂、難以統計、比賽中打字很慢。

目標：依照 `c:\Users\USER\Downloads\scouting 最後一頁.md` 的嵌套式勾選清單，把 textarea 換成結構化 UI，並把勾選結果序列化回 `comments` 字串，保持 TSV schema 不變。

## 決策紀錄

| 問題 | 選擇 | 理由 |
|------|------|------|
| 資料儲存方式 | A：序列化到既有 `comments` 單一欄位 | 不影響 TSV schema，code.gs 不用改 |
| 是否保留自由文字區 | C：僅「隊友/對手 隊號」有 text input | 聚焦快速勾選，減少打字 |
| i18n | A：新增雙語 key | 與既有雙語機制一致，英文模式仍可用 |

## UI 結構

取代 `TabViews.tsx` 中 PostMatchTab 原本的 `{t('comments')} textarea` 區塊。

### Section 1：機器異常 (Robot Issues)

11 個多選 chip（紅色系），點擊 toggle：

- no show
- 死機 (crashed)
- E-stop
- A-stop
- 低電壓 (low voltage)
- intake 吸不起來 (intake not picking up)
- shooter 不准 (shooter inaccurate)
- 過 bump 會卡住 (stuck on bump)
- 撞到 trench (hit trench)
- 有部件掉下來 (parts fell off)
- 移動有問題 (movement issue)

### Section 2：機器表現 (Robot Performance)

**Flags 區**：6 個多選 chip（黃/橙色系）

- yellow card
- red card
- 不符合預期表現 (below expectations)
- 翻車 (tipped)
- 騎在 FUEL 上 (riding on fuel)
- 卡在球上 (stuck on ball)

**Collision 區**：

- Toggle：「有過劇烈撞擊」
- 當 toggle 啟用時顯示：
  - Chip：「場地」、「機器」（可多選）
  - 當「機器」勾起時，額外顯示 text input：「隊友/對手 隊號」

**Ratings 區**：5 行，每行為 4 段式 segmented button（未評 / 很好 / 還不錯 / 差）

- 推球回 Alliance Zone（從 trench）
- 推球回 Alliance Zone（從 bump）
- 射球回 alliance zone
- 給 human (Outpost)
- Defense

預設為「未評」，表示該隊該比賽沒做這個動作。

## 資料模型

### 新增 interface（`types.ts`）

```ts
export type ChecklistRating = '' | 'good' | 'ok' | 'bad';

export interface PostMatchChecklist {
  // 機器異常
  issues: string[];          // 例：['lowVoltage', 'stuckBump']

  // 機器表現 - flags
  flags: string[];           // 例：['yellowCard', 'tipped']

  // 撞擊
  hasCollision: boolean;
  collisionField: boolean;
  collisionRobot: boolean;
  collisionTeamNumbers: string;

  // 評分
  ratings: {
    pushTrench: ChecklistRating;
    pushBump: ChecklistRating;
    shoot: ChecklistRating;
    human: ChecklistRating;
    defense: ChecklistRating;
  };
}
```

### ScoutingData 調整

新增欄位 `postMatchChecklist: PostMatchChecklist`（**不列入 `TSV_SCHEMA_MATCH`**）。

`INITIAL_DATA.postMatchChecklist` 預設全空（issues/flags 為空陣列、ratings 全為 `''`）。

既有的 `comments: string` 欄位保留，但不再由使用者直接編輯；改由 `serializeChecklist()` 每次變動時自動覆寫。

## 序列化規則

`utils/checklistSerializer.ts` 匯出：

```ts
export function serializeChecklist(c: PostMatchChecklist, t: TFunc): string
```

輸出格式（只含有值的區段，以換行分隔；隊號以逗號連接）：

```
[異常] 低電壓, 過bump卡住
[表現] yellow card, 翻車
[撞擊] 場地, 機器(1234,5678)
[推球-trench] 很好 | [推球-bump] 還不錯
[射球] 差 | [human] 很好 | [defense] 還不錯
```

規則：

- 各區段獨立一行；若該區段無勾選內容則略過該行。
- `[撞擊]` 僅在 `hasCollision = true` 時輸出。`機器` 後若有隊號則加括號。
- `[推球-...]`、`[射球]`、`[human]`、`[defense]` 等評分：值為 `''` 時略過；同類評分以 ` | ` 合併成一行（推球兩項一行，其餘評分一行）。
- 標籤與值使用當前語言（English 或繁中），透過 `t()` 取得。

## i18n keys（新增於 `LanguageContext.tsx`）

約 30 個新 key：

- 區段標題：`issuesHeader`, `performanceHeader`, `collisionSubHeader`, `ratingsSubHeader`
- 11 個 issues：`issue_noShow`, `issue_crashed`, `issue_eStop`, `issue_aStop`, `issue_lowVoltage`, `issue_intakeStuck`, `issue_shooterOff`, `issue_stuckBump`, `issue_hitTrench`, `issue_partFell`, `issue_movement`
- 6 個 flags：`flag_yellowCard`, `flag_redCard`, `flag_belowExpected`, `flag_tipped`, `flag_ridingFuel`, `flag_stuckBall`
- 撞擊：`collision_toggle`, `collision_field`, `collision_robot`, `collision_teamNumbers`
- 5 個 ratings：`rating_pushTrench`, `rating_pushBump`, `rating_shoot`, `rating_human`, `rating_defense`
- 3 個 rating 值：`rating_good` (很好/Good), `rating_ok` (還不錯/OK), `rating_bad` (差/Bad)

## 修改檔案清單

| 檔案 | 變更 | code.gs 影響 |
|------|------|------|
| `types.ts` | 新增 `PostMatchChecklist` + `ScoutingData.postMatchChecklist` + `INITIAL_DATA` 預設值 | 無 |
| `utils/checklistSerializer.ts`（新檔） | `serializeChecklist()` 函式 | 無 |
| `components/TabViews.tsx` | 重寫 `PostMatchTab` 的 comments 區塊為結構化 UI | 無 |
| `contexts/LanguageContext.tsx` | 新增 ~30 個雙語 keys | 無 |

## TSV / QR / code.gs

- `TSV_SCHEMA_MATCH` 維持 21 欄，`comments` 仍是最後一欄。
- QR Code 產生邏輯不變（`QRCodeTab.tsx` 不動）。
- Google Apps Script (code.gs) **不需變更**：它仍收到相同欄數的 TSV，只是 `comments` 欄的內容現在是結構化序列字串。

## 驗證

- `npm run build` 通過，無 TypeScript 錯誤
- 手動測試：勾選各區段、切換語言、撞擊 + 機器 + 隊號流程、reset 後 checklist 歸零
- 確認 TSV export 的 `comments` 欄內容為序列化字串

## 向下相容

- **localStorage 既有紀錄**：舊 `MatchRecord.data` 沒有 `postMatchChecklist` 欄位。載入時若偵測為 `undefined`，提供空的預設值（不阻斷載入、不刪除舊資料）。`types.ts` 定義中可為 optional，或在讀取端做 fallback。
- **HistoryEditForm.tsx**：目前讓使用者編輯 `comments` textarea。改動後，`comments` 是結構化序列字串；**保留 textarea 不變**（使用者可手動微調序列結果），**不在歷史編輯頁重建完整勾選 UI**。這是刻意的 YAGNI 取捨 — 歷史編輯頻率低，雙重維護不划算。

## 非目標（YAGNI）

- 不把 `comments` 字串反解析回 `postMatchChecklist`（歷史編輯頁僅能文字編輯）
- 不在 HistoryEditForm 重建 checklist UI
- 不做 Google Sheet 側的欄位拆分或統計（若未來需要才擴充 code.gs）
- 不支援自訂勾選項目（清單寫死）
