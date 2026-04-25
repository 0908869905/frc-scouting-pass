# Spec: 新增「射球不順」issue 欄位 (issueShooterStutter)

**日期**：2026-04-26
**版本目標**：v1.7.0 → v1.8.0
**Schema 變更**：TSV_SCHEMA_MATCH 47 → 48 欄

---

## 1. 背景與目標

### 使用者觀察的場景
比賽中發現有些機器人在射球過程中出現「短暫卡頓再恢復」的行為（例如：射到一半突然頓一下，下一顆又正常射出）。此狀況**不等於**：
- `issueShooterOff` (label 為 "Shooter inaccurate" / 「shooter 不準」)：射球**準度**問題
- `issueIntakeStuck`：Intake 機構卡死

需要新增一個獨立的 issue chip 紀錄這類「間歇性射球異常」，便於賽後資料分析時統計各隊射球穩定性。

### 命名決策

| 項目 | 值 | 理由 |
|------|------|------|
| Key (`ScoutingData` / TSV) | `issueShooterStutter` | "stutter" 語意 = 短暫卡頓又恢復，對應「不順」最精準 |
| 內部 key (`PostMatchChecklist.issues`) | `'shooterStutter'` | 與 `ISSUE_KEYS` 既有風格一致 |
| 中文 label (i18n) | 射球不順 | 使用者指定 |
| 英文 label (i18n) | Shooter stutters | 對應「不順」語意（不用 "jams" — 該詞偏「完全卡死」） |
| Schema 位置 | 緊接 `issueShooterOff` 之後 | 維持 shooter 相關群組連續性，便於未來統計 |

### 為何避免重用 `issueShooterOff`
既有 `issueShooterOff` key 名為 "Off" 但 label 為「不準」/ "inaccurate"，已是 key/label 語意不一致的歷史包袱。本次**不擴張**該欄位語意（避免再混疊），改新增明確命名的 `issueShooterStutter`。

---

## 2. Schema 變更

### TSV_SCHEMA_MATCH（主 repo `constants.ts` + scanner `Code.gs` + scanner `src/constants/schema.ts`）

**變更前**（47 欄，v1.7.0）：
```
... issueIntakeStuck, issueShooterOff, issueStuckBump, ...
```

**變更後**（48 欄，v1.8.0）：
```
... issueIntakeStuck, issueShooterOff, issueShooterStutter, issueStuckBump, ...
```

前 17 欄（PreMatch / Auto / Teleop / Penalty / Climb）**完全不動**。
後段 issue 群組由 11 個變 12 個，其餘 (6 flag + 4 collision + 8 rating + 1 comments) 不變。

### `ScoutingData` 介面（`types.ts`）
新增一個 boolean 欄位：
```typescript
issueShooterStutter: boolean;
```

`INITIAL_DATA` 同步加 `issueShooterStutter: false`。

### `PostMatchChecklist`（`types.ts`）
**型別不需改** — `issues` 欄位是 `IssueKey[]`，`IssueKey` 由 `ISSUE_KEYS` 推導。新增 `'shooterStutter'` 進 `ISSUE_KEYS` 後，`IssueKey` 自動擴展。

### `ISSUE_KEYS` & `ISSUE_FIELD_MAP`（`utils/checklistSerializer.ts`）

```typescript
export const ISSUE_KEYS = [
  'noShow', 'crashed', 'eStop', 'aStop', 'lowVoltage',
  'intakeStuck', 'shooterOff', 'shooterStutter', // <-- 新增
  'stuckBump', 'hitTrench', 'partFell', 'movement',
] as const;

const ISSUE_FIELD_MAP: Record<IssueKey, keyof ScoutingData> = {
  // ...
  shooterOff:    'issueShooterOff',
  shooterStutter:'issueShooterStutter', // <-- 新增
  // ...
};
```

### i18n（`contexts/LanguageContext.tsx` + scanner `src/i18n/locales/*.ts`）
EN：`issue_shooterStutter: "Shooter stutters"`
ZH：`issue_shooterStutter: "射球不順"`

Scanner 端對應：`fields.issueShooterStutter` 同 EN / ZH。

---

## 3. 修改檔案清單

### 主 repo (`D:\FRC\frc-6998-scouting-pass\FRC`)

| # | 檔案 | 變更類型 |
|---|------|----------|
| 1 | `constants.ts` | `TSV_SCHEMA_MATCH` 加 `issueShooterStutter`（位置：緊接 `issueShooterOff` 後） |
| 2 | `types.ts` | `ScoutingData` 加 `issueShooterStutter: boolean`；`INITIAL_DATA` 加 `false` |
| 3 | `utils/checklistSerializer.ts` | `ISSUE_KEYS` 加 `'shooterStutter'`；`ISSUE_FIELD_MAP` 加 mapping |
| 4 | `contexts/LanguageContext.tsx` | EN + ZH 加 `issue_shooterStutter` |

**UI 不需改**：`PostMatchTab` 是 schema-driven（迭代 `ISSUE_KEYS` 自動渲染 chip）。

**`services/googleSheets.ts` 不需改**：issue 欄位是 boolean → `'0'`/`'1'`，不在 `PRESERVE_EMPTY_KEYS`（那是給 text 空值要輸出 `''` 的欄位用的）。

### Scanner repo (`D:\FRC\frc-scout-scanner`) — 三處鏡像 + i18n

| # | 檔案 | 變更類型 |
|---|------|----------|
| 5 | `google-apps-script/Code.gs` | `TSV_SCHEMA_MATCH` 加 `issueShooterStutter`；版本字串 `1.7.0` → `1.8.0` |
| 6 | `src/constants/schema.ts` | `TSV_SCHEMA_MATCH` + `FIELD_LABELS` 加新 key |
| 7 | `src/utils/decoder.ts` | `detectQRType` 長度比對 `47` → `48` |
| 8 | `src/i18n/locales/en.ts` | `fields.issueShooterStutter` |
| 9 | `src/i18n/locales/zh-TW.ts` | `fields.issueShooterStutter` |

---

## 4. 上次踩坑對照表（必讀）

| 上次踩過的坑 | 這次的防範 |
|--------------|-----------|
| Scanner 前端漏同步 (`schema.ts` + `decoder.ts`) | ✅ 列入清單 #6, #7（必動） |
| `detectQRType` 長度比對沒改 → QR 判為 `unknown` → Path 配對失敗 | ✅ 列入清單 #7 |
| i18n locales 漏更新（不 block 但顯示 fallback raw key） | ✅ 列入清單 #8, #9 |
| 部署後忘記 GET `?action=fixHeaders` | ✅ 寫進部署順序步驟 4 |
| `PostMatchChecklist` 變動沒同時展開 `checklistToFlatFields(next)` | ✅ 既有 `updateChecklist` 邏輯不動，自動受惠 |
| `PRESERVE_EMPTY_KEYS` 沒加新欄位 | ✅ 本次無新增 text 欄位，不需動該 Set |

---

## 5. 部署順序（Stage 順序不可顛倒）

1. **Stage 1：主 repo 改完**
   - `npm run build` 通過
   - Commit + push → Vercel 自動部署 Scouting PASS 前端
2. **Stage 2：Scanner repo 改完**
   - 改 `Code.gs` + `src/constants/schema.ts` + `src/utils/decoder.ts` + `src/i18n/locales/en.ts` + `zh-TW.ts`
   - Commit + push → Vercel 自動部署 Scanner 前端
3. **Stage 3：使用者手動 — GAS 部署**
   - 把 scanner 最新 `google-apps-script/Code.gs` 覆貼到 GAS project
   - 部署新版（內部版本字串 1.8.0）
4. **Stage 4：使用者手動 — Sheet 升級**
   - 對每個活躍 Sheet GET `<webAppUrl>?action=fixHeaders` 升級到 48 欄標頭
5. **Stage 5：端對端驗證**
   - 端對端掃 QR 驗證：48 欄 Match QR 解碼正常 + Path QR 配對成功
   - 在 PostMatchTab 點「射球不順」chip → 確認 TSV 該欄輸出 `'1'`、checklist 同步

---

## 6. 程式化驗證腳本（建議於改完後執行）

驗證主 repo `TSV_SCHEMA_MATCH` ≡ scanner `Code.gs` `TSV_SCHEMA_MATCH` ≡ scanner `src/constants/schema.ts` `TSV_SCHEMA_MATCH`：

```js
const fs = require('fs');
const extract = path => {
  const text = fs.readFileSync(path, 'utf-8');
  const m = text.match(/TSV_SCHEMA_MATCH\s*=\s*\[([\s\S]*?)\]/);
  if (!m) throw new Error(`No TSV_SCHEMA_MATCH in ${path}`);
  return [...m[1].matchAll(/'([a-zA-Z][\w]*)'/g)].map(x => x[1]);
};

const a = extract('D:/FRC/frc-6998-scouting-pass/FRC/constants.ts');
const b = extract('D:/FRC/frc-scout-scanner/google-apps-script/Code.gs');
const c = extract('D:/FRC/frc-scout-scanner/src/constants/schema.ts');

console.log('main:', a.length, 'gas:', b.length, 'scanner:', c.length);
console.log('main vs gas:', JSON.stringify(a) === JSON.stringify(b) ? 'OK' : 'DIFF');
console.log('main vs scanner:', JSON.stringify(a) === JSON.stringify(c) ? 'OK' : 'DIFF');
```

預期輸出：`main: 48 gas: 48 scanner: 48` 三方相同。

---

## 7. Risk / 非目標

### Risks
- 既有 history record（localStorage `frc_match_history`）已存的舊紀錄沒有 `issueShooterStutter` 欄位 — JSON 反序列化後該欄位為 `undefined`。`HistoryEditForm` 若有迭代 issue 顯示，需確認 `undefined` 與 `false` 行為一致（**檢查點：** 改完後手動驗證歷史紀錄編輯不會跳錯）。
- v1.8.0 部署過渡期：若使用者用舊版 Scouting PASS（v1.7.0，47 欄 QR）掃描配新版 scanner（v1.8.0，期待 48 欄），會被 `detectQRType` 判為 unknown。緩解：使用者強制 reload 頁面拿 Vercel 最新版本即可。

### 非目標
- 不重構既有 `issueShooterOff` 的 key/label 對齊問題（保留歷史包袱以免引發更大破壞）
- 不擴張 `services/googleSheets.ts` `PRESERVE_EMPTY_KEYS`（本次無 text 欄位變更）
- 不變更 PostMatchTab UI 排版（schema-driven，自動渲染新 chip）

---

## 8. 完成驗收條件

- [ ] 主 repo `npm run build` 通過
- [ ] 主 repo + scanner repo 各自 commit & push 到 origin/main
- [ ] 三方 `TSV_SCHEMA_MATCH` 程式化 diff 全為 OK（48 欄一致）
- [ ] 手動測試：開 dev server，PostMatchTab 看到第 12 個 issue chip「射球不順」
- [ ] 手動測試：勾選後產生 QR → TSV 該欄輸出 `1`
- [ ] 使用者完成外部部署步驟（GAS、fixHeaders）後，端對端 QR 掃描驗證

---

*Last updated: 2026-04-26*
