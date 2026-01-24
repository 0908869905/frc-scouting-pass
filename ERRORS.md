# Error Knowledge Base

記錄所有遇到的錯誤，避免重複犯錯。

> **Note (2026-01-23):** Tauri/Windows SDK 相關錯誤已移至 Video Analyzer 專案

---

## Quick Reference

| Category | Count | Last Updated |
|----------|-------|--------------|
| Build/Compile | 0 | - |
| Runtime | 0 | - |
| Configuration | 0 | - |
| Code Quality | 1 | 2026-01-22 |

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

*Last updated: 2026-01-24*
