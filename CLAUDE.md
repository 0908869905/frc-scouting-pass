# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FRC 6998 Scouting PASS - A React TypeScript scouting application for FIRST Robotics Competition Team 6998 (2026 REBUILT season).

- **Web App**: https://frc-ten.vercel.app
- **GitHub**: https://github.com/0908869905/FRC
- **App ID**: `com.frc6998.scouting` (iOS)

## Tech Stack

- React 18.2 + TypeScript 5.2 + Vite 5.0
- Tailwind CSS (local build via `@tailwindcss/vite` plugin, entry: `styles.css`)
- Fonts: `@fontsource/inter` + `@fontsource/orbitron` (local, no CDN)
- Lucide React (icons), React QR Code, LZ-String (compression)
- Capacitor 8.0 for iOS App packaging
  - `@capacitor/splash-screen` - App 啟動動畫
  - `@capacitor/status-bar` - 狀態列外觀
  - `@capacitor/haptics` - Counter 觸覺回饋
- PWA enabled (service worker + manifest; SW disabled in Capacitor native environment)
- No backend - localStorage for persistence, Google Apps Script for sync

## Build Commands

```bash
npm run dev      # Dev server on localhost:5173 with HMR
npm run build    # Production bundle to /dist
npm run preview  # Test production build locally
```

## iOS App Packaging (Mac only)

```bash
npm run build                # Build web assets first
npx cap add ios              # Create iOS project (first time only)
npx cap sync                 # Sync web assets to iOS
npx cap open ios             # Open in Xcode
```

App icons are pre-generated in `ios-icons/` directory.

## Architecture

### Data Flow
1. User fills form phases: PreMatch → Auton → Teleop → **Penalty** → PostMatch
2. **Validation at each phase transition:**
   - PreMatch → Auton: Required fields + Team number format (positive integer, no upper limit)
   - Auton → Teleop: Auto path starting position (must be in starting zone)
   - Climb status = None: auto-reset time=0, position=None
3. **Two QR codes** generated with LZ-String compressed data:
   - Match Data QR (cyan) - all scouting data except path (21 fields)
   - Auto Path QR (amber) - eventCode, matchNumber, teamNumber, alliance, autoPath (5 fields)
4. TSV export for copying or Google Sheets upload
5. On reset, **matchNumber auto-increments by 1** (all match levels, not just Quals)
6. Offline queue persists to localStorage for later sync

### Validation Rules (防呆機制)
| Field | Rule | Location |
|-------|------|----------|
| Team Number | Positive integer (no upper limit) | `App.tsx`, `TabViews.tsx` |
| Auto Path Start | Red: X = 25-28.5%, Blue: X = 71.5-75% | `App.tsx`, `FieldCanvas.tsx` |

**Starting Zone Constants** (must match in both files):
```typescript
const STARTING_ZONE_WIDTH = 3.5;          // 3.5% width
const RED_STARTING_ZONE_OFFSET = 25;      // Red zone: X = 25-28.5%
const BLUE_STARTING_ZONE_OFFSET = 71.5;   // Blue zone: X = 71.5-75%
```

### UI Notes
- **Header**: Left side shows app name + subtitle with `#teamNumber` (visible during scouting)

### Key Files
- `App.tsx` - Main container, phase navigation, form state management, header with team number display
- `styles.css` - Tailwind CSS entry point + @theme brand colors + animations
- `types.ts` - Core interfaces (ScoutingData, MatchRecord, enums)
- `constants.ts` - APP_CONFIG, TSV_SCHEMA definitions
- `services/storage.ts` - localStorage for offline queue & history + `updateMatchRecord`, `getMatchRecord`
- `services/googleSheets.ts` - TSV generation, Google Apps Script upload, Douglas-Peucker path simplification (`simplifyPath`)
- `contexts/LanguageContext.tsx` - i18n (English/Traditional Chinese, 115+ keys)
- `components/TabViews.tsx` - Form phase components with Counter/inputs
- `components/QRCodeTab.tsx` - QR generation & export functionality + haptic feedback

### UX Enhancement Files (2026-02-05)
- `utils/haptics.ts` - Unified haptic feedback API (Capacitor + Web)
- `hooks/useSwipeNavigation.ts` - Swipe gesture navigation between phases
- `hooks/useRecentScouters.ts` - Recent scouter names memory (localStorage)
- `data/events2026.ts` - 2026 official event list (221 events from TBA, grouped by Week)
- `data/eventSchedule.ts` - Match schedule schema + Magnolia Regional teams data + `getEventTeams()` function
- `components/ui/AutoSaveIndicator.tsx` - Auto-save timestamp display
- `components/ui/ScouterNameInput.tsx` - Scouter name input with recent suggestions
- `components/ui/EventCodeSelect.tsx` - Searchable event code selector
- `components/ui/QuickTeamSelect.tsx` - Quick team selection from match schedule
- `components/HistoryEditForm.tsx` - History record editing form
- `utils/checklistSerializer.ts` - PostMatch 勾選清單常數表（ISSUE_KEYS/FLAG_KEYS/RATING_ROW_KEYS）+ `checklistToFlatFields()` 單一入口（輸出 30 個扁平欄位）+ `ISSUE_FIELD_MAP/FLAG_FIELD_MAP/RATING_FIELD_MAP` 對應表 + `toggleInArray()` helper

### Component Pattern
All form tabs use `TabProps` interface: `{ data: ScoutingData, update: (updates) => void, handedness: Handedness }`

### 2026 REBUILT Form Structure
| Phase | Key Fields |
|-------|-----------|
| PreMatch | scouterName, eventCode, matchLevel, matchNumber, **alliance** (Red/Blue), teamNumber |
| Auton | autoPath (FieldCanvas), autoFuel, autoClimbStatus, autoClimbTime (Stopwatch) |
| Teleop | bumpCount, trenchCount, fuelDroppedOnBump, teleFuel, minorPenalty, majorPenalty, teleClimbStatus, teleClimbPosition, teleClimbTime (Stopwatch) |
| PostMatch | defenseRating, driverSkill, speedRating, subjectiveNotes, **postMatchChecklist** (issues/flags/collision/ratings/**extraComments**) — 扁平化為 27 欄：11 issue (0/1) + 6 flag (0/1) + 4 collision (3 bool + 1 text) + 8 rating text (good/ok/bad/空) + 1 comments (free-text) |

**TSV Schema**:
- `TSV_SCHEMA_MATCH`: **47 欄位** (v1.7.0，自 2026-04-21 起)
  - 演進：v1.5.0 (23 欄，拆 comments 為 3) → v1.6.0 (44 欄，扁平化 PostMatch) → v1.7.0 (47 欄，+3 fuel ratings)
  - 前 17 欄（PreMatch / Auto / Teleop / Penalty / Climb）完全不變
  - 後 30 欄：11 issue (0/1) + 6 flag (0/1) + 3 collision bool + 1 collision text + 8 rating text + 1 comments
  - 8 rating：ratingPushTrench, ratingPushBump, ratingShoot（射球回 Alliance Zone）, ratingHuman, ratingDefense, ratingIntakeFuel, ratingTransportFuel, ratingShootFuel
- `TSV_SCHEMA_PATH`: 5 欄位 (eventCode, matchNumber, teamNumber, alliance, autoPath)
- v1.6.0 已**刪除** `robotDied` / `almostTipped` / `ridingOnBall` 欄位（Phase 39 UI 已無 Toggle，Phase 43 schema 一併清理）

### Adding New Form Fields
1. Add field to `ScoutingData` interface in `types.ts`
2. Add to `TSV_SCHEMA_MATCH` or `TSV_SCHEMA_PIT` in `constants.ts`
3. Add UI component in appropriate tab in `TabViews.tsx`
4. Add translation keys in `LanguageContext.tsx`

## Configuration

- `constants.ts` - Update `APP_CONFIG.googleScriptUrl` for real Google Apps Script
- `styles.css` - Tailwind entry + `@theme` brand colors (Cyan #06b6d4, dark theme slate-900/950) + animations + `.no-scrollbar`
- `vite.config.ts` - Tailwind CSS Vite plugin configuration
- `vercel.json` - SPA rewrite rules
- `capacitor.config.ts` - iOS app configuration + native plugins (SplashScreen, StatusBar)
- `public/manifest.json` - PWA metadata (orientation: "any" for landscape support)
- `public/privacy.html` - Privacy Policy (App Store requirement)

## Development Notes

- **Mobile-first**: Test at 375px width minimum, handedness preference affects button layout
- **Offline-first**: localStorage is primary storage, server sync is fallback
- **localStorage Keys**:
  - `frc_scouting_data` - Current scouting session data
  - `frc_offline_queue` - Offline sync queue
  - `frc_match_history` - Match history records
  - `recent_scouters` - Recent 3 scouter names (for quick selection)
- **i18n**: All user-facing text through `useLanguage()` hook
- **State**: React hooks only (useState, useContext) - no external state management
- **Google Sheets**: Uses no-cors mode; data transmitted as TSV with unicode escaping

## Code Style Guidelines

- **Dead code elimination**: Remove unused functions, imports, and variables
- **DRY principle**: Extract repeated logic into helper functions or constants (e.g., `MODE_STYLES` mapping)
- **Event listeners**: Always use named function references for proper cleanup (not anonymous functions)
- **Constants over switches**: Prefer object mappings over switch statements for style/config lookups

## Common Pitfalls (防錯清單)

- ⚠️ **Event listener 匿名函數**: 必須用具名函數才能正確 removeEventListener
- ⚠️ **未使用的 imports/functions**: 定期執行 `/simplify` 清理死碼
- ⚠️ **iOS 打包前**: 必須先執行 `npm run build`，再執行 `npx cap sync`
- ⚠️ **起始區域常數**: `STARTING_ZONE_WIDTH` 和 `STARTING_ZONE_OFFSET` 必須在 `App.tsx` 和 `FieldCanvas.tsx` 保持一致
- ⚠️ **FieldCanvas 全螢幕**: 使用 React `createPortal` 渲染到 `document.body`，尺寸用 `window.innerWidth/Height` 計算（不使用 ref 量測 DOM）
- ⚠️ **FieldCanvas 方向自動切換**: 透過 `window.matchMedia('(orientation: landscape)')` 監聽方向 — 橫向自動進入 fullscreen，直向退出。Listener 必須在 cleanup 中 `removeEventListener('change', ...)` 避免記憶體洩漏
- ⚠️ **PostMatchChecklist 扁平寫入 (v1.7.0)**: `postMatchChecklist` 每次變動必須在同一個 `update()` 呼叫同時展開 `...checklistToFlatFields(next)`，否則 30 個扁平欄位會脫節（TSV 匯出讀的是扁平欄位本身，不是 checklist）。常數表（ISSUE_KEYS / FLAG_KEYS / RATING_ROW_KEYS）+ 對應表（ISSUE_FIELD_MAP / FLAG_FIELD_MAP / RATING_FIELD_MAP）只放在 `utils/checklistSerializer.ts`，UI 必須引用該檔而不可自己寫死 chip 清單
- ⚠️ **Collision clamp in serializer**: `checklistToFlatFields` 內部用 `c.hasCollision && c.collisionField`（及其他子欄位）clamp 所有 collision 細節欄位 — 即使使用者切 `hasCollision=false` 後 checklist 內仍留子欄位狀態，輸出端會全部歸零，避免 TSV / Sheets 矛盾資料（主旗標 0、細節欄卻有值）
- ⚠️ **PRESERVE_EMPTY_KEYS Set (googleSheets.ts)**: 扁平化後新增的 `comments / collisionTeamNumbers / rating*`（8 個 rating）空值必須輸出 `''` 而非 `'None'`，否則 Sheets 分析時 `COUNTIF(..., "None")` 會把 legit 空值混進統計。PreMatch 等舊欄位維持 `'None'` fallback 避免 breaking change。新增 PostMatch 扁平欄位時記得加入 `PRESERVE_EMPTY_KEYS`
- ⚠️ **TSV schema 擴充後的部署**: 改 `TSV_SCHEMA_MATCH` 長度後，既有 Google Sheets 的標頭不會自動更新。部署新 Code.gs 後必須手動 GET `?action=fixHeaders` 一次，讓試算表升級標頭，否則後續上傳會欄位錯位
- ⚠️ **Scanner repo Schema 三處鏡像**: 改 `TSV_SCHEMA_MATCH` 時 scanner repo 有 **三個位置** 要同步：(1) `google-apps-script/Code.gs` (backend)、(2) `src/constants/schema.ts` (frontend schema 常數)、(3) `src/utils/decoder.ts` (`detectQRType` 長度比對)。只同步 (1) 會導致 QR 被判為 `'unknown'` → 下游 Match / Path 配對全斷。i18n locales (`src/i18n/locales/*.ts`) 漏更新不 block 功能但 UI 會 fallback 到 raw key
- ⚠️ **PostMatch 可摺疊區段 pattern**: 多 chip toggle 頁面（機器異常 11 chips、機器表現 6 chips）採用「點擊標題展開收合 + header 顯示啟用數量 badge」的 pattern，未來類似 UI 應延用
- ✅ **PostMatch 扁平化 + fuel ratings 已完成 (2026-04-21)**: v1.7.0 = 47 欄 schema。前 17 欄不變；後 30 欄 = 11 issue (0/1) + 6 flag (0/1) + 4 collision (3 bool + 1 text) + 8 rating text (good/ok/bad/空) + 1 comments (free-text)。架構：`checklistToFlatFields()` 單一入口展開扁平欄位、collision clamp 邏輯確保輸出一致、`PRESERVE_EMPTY_KEYS` Set 控制空值格式。8 rating 包含 5 個原有 + 3 個新增 fuel 動作評分（intakeFuel / transportFuel / shootFuel）

## Before Committing

1. 執行 `npm run build` 確認無 TypeScript 編譯錯誤
2. 確認無未使用的 imports
3. 確認 event listener 有正確清理
