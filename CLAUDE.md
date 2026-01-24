# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FRC 6998 Scouting PASS - A React TypeScript scouting application for FIRST Robotics Competition Team 6998 (2026 Reefscape season).

- **Web App**: https://frc-ten.vercel.app
- **GitHub**: https://github.com/0908869905/FRC
- **App ID**: `com.frc6998.scouting` (iOS)

## Tech Stack

- React 18.2 + TypeScript 5.2 + Vite 5.0
- Tailwind CSS (via CDN in index.html)
- Lucide React (icons), React QR Code, LZ-String (compression)
- Capacitor 8.0 for iOS App packaging
- PWA enabled (service worker + manifest)
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
1. User fills form phases: PreMatch → Auton → Teleop → PostMatch
2. Required fields validated before advancing
3. QR code generated with LZ-String compressed data
4. TSV export for copying or Google Sheets upload
5. Offline queue persists to localStorage for later sync

### Key Files
- `App.tsx` - Main container, phase navigation, form state management
- `types.ts` - Core interfaces (ScoutingData, MatchRecord, enums)
- `constants.ts` - APP_CONFIG, TSV_SCHEMA definitions
- `services/storage.ts` - localStorage for offline queue & history
- `services/googleSheets.ts` - TSV generation & Google Apps Script upload
- `contexts/LanguageContext.tsx` - i18n (English/Traditional Chinese, 90+ keys)
- `components/TabViews.tsx` - Form phase components with Counter/inputs
- `components/QRCodeTab.tsx` - QR generation & export functionality

### Component Pattern
All form tabs use `TabProps` interface: `{ data: ScoutingData, updateData: (updates) => void, handedness: Handedness }`

### Adding New Form Fields
1. Add field to `ScoutingData` interface in `types.ts`
2. Add to `TSV_SCHEMA_MATCH` or `TSV_SCHEMA_PIT` in `constants.ts`
3. Add UI component in appropriate tab in `TabViews.tsx`
4. Add translation keys in `LanguageContext.tsx`

## Configuration

- `constants.ts` - Update `APP_CONFIG.googleScriptUrl` for real Google Apps Script
- `index.html` - Tailwind config (brand colors: Cyan #06b6d4, dark theme slate-900/950)
- `vercel.json` - SPA rewrite rules
- `capacitor.config.ts` - iOS app configuration
- `public/manifest.json` - PWA metadata

## Development Notes

- **Mobile-first**: Test at 375px width minimum, handedness preference affects button layout
- **Offline-first**: localStorage is primary storage, server sync is fallback
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

## Before Committing

1. 執行 `npm run build` 確認無 TypeScript 編譯錯誤
2. 確認無未使用的 imports
3. 確認 event listener 有正確清理
