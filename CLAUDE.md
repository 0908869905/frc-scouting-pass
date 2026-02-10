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
   - Climb status = None: auto-reset time=0, position=Center
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
- `data/events2026.ts` - 2026 event list (offline TBA data)
- `data/eventSchedule.ts` - Match schedule schema + demo data
- `components/ui/AutoSaveIndicator.tsx` - Auto-save timestamp display
- `components/ui/ScouterNameInput.tsx` - Scouter name input with recent suggestions
- `components/ui/EventCodeSelect.tsx` - Searchable event code selector
- `components/ui/QuickTeamSelect.tsx` - Quick team selection from match schedule
- `components/HistoryEditForm.tsx` - History record editing form

### Component Pattern
All form tabs use `TabProps` interface: `{ data: ScoutingData, update: (updates) => void, handedness: Handedness }`

### 2026 REBUILT Form Structure
| Phase | Key Fields |
|-------|-----------|
| PreMatch | scouterName, eventCode, matchLevel, matchNumber, **alliance** (Red/Blue), teamNumber |
| Auton | autoPath (FieldCanvas), autoFuel, autoClimbStatus, autoClimbTime (Stopwatch) |
| Teleop | bumpCount, trenchCount, fuelDroppedOnBump, teleFuel, minorPenalty, majorPenalty, teleClimbStatus, teleClimbPosition, teleClimbTime (Stopwatch) |
| PostMatch | robotDied, almostTipped, ridingOnBall, defenseRating, driverSkill, speedRating, comments, subjectiveNotes |

**TSV Schema**:
- `TSV_SCHEMA_MATCH`: 21 欄位 (詳見 `constants.ts`)
- `TSV_SCHEMA_PATH`: 5 欄位 (eventCode, matchNumber, teamNumber, alliance, autoPath)

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

## Before Committing

1. 執行 `npm run build` 確認無 TypeScript 編譯錯誤
2. 確認無未使用的 imports
3. 確認 event listener 有正確清理
