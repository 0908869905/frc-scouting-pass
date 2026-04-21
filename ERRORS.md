# Error Knowledge Base

記錄所有遇到的錯誤，避免重複犯錯。

> **Note (2026-01-23):** Tauri/Windows SDK 相關錯誤已移至 Video Analyzer 專案

---

## Quick Reference

| Category | Count | Last Updated |
|----------|-------|--------------|
| Build/Compile | 0 | - |
| Runtime | 1 | 2026-04-21 |
| Configuration | 0 | - |
| Code Quality | 1 | 2026-01-22 |

---

## Runtime Issues

### ERR-008: Scanner frontend schema mismatch after 23→47 migration

**Date:** 2026-04-21
**Severity:** 🔴 Blocker
**Category:** Runtime / Cross-repo sync

**Symptom:**
使用者掃 47 欄 Match QR 時在 scanner console 報：
```
[detectQRType] Unknown field count: 47, expected: match=23
```
且下游出現「Path QR 抓不到對應 Match 資料」的表面症狀。

**Root Cause:**
改 Scouting PASS `TSV_SCHEMA_MATCH` 到 47 欄時，scanner repo 只同步了 `google-apps-script/Code.gs`（後端），忽略 scanner repo 前端也有獨立 TSV schema 鏡像：
- `src/constants/schema.ts` 的 `TSV_SCHEMA_MATCH` 仍為 23 欄
- `src/utils/decoder.ts` 的 `detectQRType` 長度判斷仍比對 23

47 欄 QR 被 `detectQRType` 判為 `'unknown'` → values 映射成 `field1/field2/...` → `getMatchKey()` 回傳空殼 key → Path QR 用 `(eventCode, matchNumber, teamNumber)` 找不到任何 Match。所謂「路徑抓不到資料」其實是 Match 解碼失敗的下游症狀。

**Solution:**
Commit `31d7844` in scanner repo:
- `src/constants/schema.ts` — 替換為 47 欄 schema + 重建 `FIELD_LABELS`
- `src/utils/decoder.ts` — `detectQRType` 長度判斷更新；length-23 直接歸 `'pit-external'`（不再與 Match 衝突）
- `src/i18n/locales/en.ts` + `zh-TW.ts` — `fields` 字典完整重建（29 個新 entries）

**Prevention:**
改 `TSV_SCHEMA_MATCH` 時 scanner repo 必須同步**三個鏡像位置**：
1. `google-apps-script/Code.gs` (backend)
2. `src/constants/schema.ts` (frontend schema 常數)
3. `src/utils/decoder.ts` (`detectQRType` 長度比對邏輯)

i18n locales 漏更新不 block 功能（UI 會 fallback 到 raw key），但視覺會變醜。
已將此 checklist 存入 `C:\Users\USER\.claude\projects\D--FRC-frc-6998-scouting-pass\memory\`。

---

## Code Quality Issues

### ERR-001: Event listener cleanup with anonymous function

**Date:** 2026-01-22
**Severity:** 🟢 Minor
**Category:** Code Quality

**Symptom:**
Memory leak 或 event handler 累積。

**Root Cause:**
使用匿名函數註冊 event listener，導致 removeEventListener 無法移除：
```typescript
// 錯誤示範
video.addEventListener('ended', () => setIsPlaying(false));
video.removeEventListener('ended', () => setIsPlaying(false)); // 無效！
```

**Solution:**
使用具名函數：
```typescript
const handleEnded = () => setIsPlaying(false);
video.addEventListener('ended', handleEnded);
video.removeEventListener('ended', handleEnded); // 正確移除
```

**Prevention:**
- Code review 時檢查所有 addEventListener/removeEventListener 配對
- 使用 ESLint 規則檢測

---

## Archived Errors (Video Analyzer)

以下錯誤已移至 `D:\frc-video-analyzer` 專案：

- ERR-002: Tauri v2 shell-open feature not found
- ERR-003: LNK1181 cannot open kernel32.lib
- ERR-004: vcvars64.bat LIB paths not set
- ERR-005: Windows Defender file locking (error 32)
- ERR-006: Missing icon files
- ERR-007: PowerShell cannot execute .bat files

---

## Template for New Errors

```markdown
### ERR-XXX: [Error Title]

**Date:** YYYY-MM-DD
**Severity:** 🔴 Blocker / 🟡 Major / 🟢 Minor
**Category:** Build / Runtime / Configuration / Code Quality

**Symptom:**
[描述錯誤訊息或現象]

**Root Cause:**
[分析根本原因]

**Solution:**
[詳細解決步驟]

**Prevention:**
[如何避免再次發生]
```

---

*Last updated: 2026-04-21 (ERR-008: Scanner frontend schema mirror mismatch)*
