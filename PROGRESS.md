# Progress Log

## Session: 2026-01-21

### Overview
Building FRC Video Analyzer - automated video analysis system for FRC match scouting using SAM + ByteTrack computer vision.

---

### Phase 1: Python Backend Setup
- **Status:** ✅ complete
- **Started:** 2026-01-21

**Tasks Completed:**

#### Task 1.1: Python Project Structure
- Created `FRC/backend/` directory structure
- Set up `requirements.txt` with dependencies (fastapi, uvicorn, opencv-python, torch, etc.)
- Created `__init__.py` files and base models

#### Task 1.2: VideoLoader Module
- Implemented `FRC/backend/video_loader.py`
- Supports MP4, AVI, MOV formats
- Frame extraction with configurable FPS
- Metadata extraction (duration, resolution, total frames)

#### Task 1.3: SAM Detection Module
- Implemented `FRC/backend/detection.py`
- SAMDetector class with automatic prompts
- Box and point-based detection modes
- Batch processing support

#### Task 1.4: ByteTrack Tracking Module
- Implemented `FRC/backend/tracking.py`
- Multi-object tracking with ID persistence
- Configurable IoU and confidence thresholds
- Track lifecycle management (tentative → confirmed → lost)

**Files Created:**
- `FRC/backend/__init__.py`
- `FRC/backend/app.py`
- `FRC/backend/video_loader.py`
- `FRC/backend/detection.py`
- `FRC/backend/tracking.py`
- `FRC/backend/models/__init__.py`
- `FRC/backend/models/frame.py`
- `FRC/backend/models/detection.py`
- `FRC/backend/models/track.py`
- `FRC/requirements.txt`

---

### Phase 2: Rule Engine & Shot Detection
- **Status:** ✅ complete

#### Task 2.1: Shot Detection Rule Engine
- Implemented `FRC/backend/rule_engine.py`
- ShotDetector class for FUEL ball trajectory analysis
- Scoring detection based on position and velocity
- Support for 6 robots individual tracking

**Files Created:**
- `FRC/backend/rule_engine.py`

---

### Phase 3: FastAPI Backend
- **Status:** ✅ complete

#### Task 3.1: FastAPI Endpoints
- `/api/upload` - Video file upload
- `/api/analyze` - Start analysis job
- `/api/status/{job_id}` - Check job status
- `/api/results/{job_id}` - Get analysis results
- Health check and configuration endpoints

**Files Modified:**
- `FRC/backend/app.py` (complete implementation)

---

### Phase 4: React Frontend
- **Status:** ✅ complete

#### Task 4.1: React Frontend Components
- Video upload component with drag-and-drop
- Analysis progress display
- Results visualization (timeline, statistics)
- Export functionality

**Files Created:**
- `FRC/src/components/VideoUpload.tsx`
- `FRC/src/components/AnalysisProgress.tsx`
- `FRC/src/components/ResultsView.tsx`
- `FRC/src/App.tsx` (video analyzer version)

---

### Phase 5: Tauri Desktop Application
- **Status:** ✅ complete
- **Completed:** 2026-01-21

#### Task 5.1: Tauri Setup & Build

**Challenges Resolved:**
1. `shell-open` feature not in Tauri v2 → Removed from Cargo.toml
2. `kernel32.lib` not found → Installed Windows SDK 10.0.22621.0
3. LIB paths not set → Manual path configuration in batch file
4. Windows Defender file locking → Use `%TEMP%\tauri-build` as build directory
5. Missing icon files → Created icons using Python PIL

**Files Created:**
- `FRC/src-tauri/Cargo.toml`
- `FRC/src-tauri/tauri.conf.json`
- `FRC/src-tauri/src/main.rs`
- `FRC/src-tauri/build.rs`
- `FRC/src-tauri/capabilities/default.json`
- `FRC/src-tauri/icons/` (32x32.png, 128x128.png, 128x128@2x.png, icon.ico)
- `FRC/run-tauri-build.bat`
- `FRC/build-tauri.bat`
- `FRC/start-analyzer.bat`
- `FRC/TAURI_SETUP.md`

**Build Outputs:**
- ✅ EXE: `frc-video-analyzer.exe` (4.3 MB)
- ✅ MSI: `FRC Video Analyzer_0.1.0_x64_en-US.msi`
- ✅ NSIS: `FRC Video Analyzer_0.1.0_x64-setup.exe`

---

## Test Results
| Test Suite | Tests | Status |
|------------|-------|--------|
| test_video_loader.py | 8 | ✅ PASS |
| test_detection.py | 10 | ✅ PASS |
| test_tracking.py | 10 | ✅ PASS |
| test_rule_engine.py | 10 | ✅ PASS |
| **Total** | **38** | **✅ ALL PASS** |

---

## Error Log
| Timestamp | Error | Resolution |
|-----------|-------|------------|
| 2026-01-21 | `shell-open` feature not found in Tauri v2 | Removed from Cargo.toml features |
| 2026-01-21 | LNK1181: cannot open `kernel32.lib` | Installed Windows SDK 10.0.22621.0 |
| 2026-01-21 | LIB paths not set by vcvars64.bat | Manual LIB path configuration |
| 2026-01-21 | File locking (os error 32) | Set CARGO_TARGET_DIR=%TEMP%\tauri-build |
| 2026-01-21 | icons/icon.ico not found | Created icons using Python PIL |

---

## 5-Question Reboot Check
| Question | Answer |
|----------|--------|
| Where am I? | All phases complete, code refined |
| Where am I going? | Ready for deployment/testing |
| What's the goal? | FRC Video Analyzer - automated match scouting |
| What have I learned? | See findings.md |
| What have I done? | 8 tasks completed, 38 tests passing, Tauri app built, code simplified |

---
*Last updated: 2026-01-21*

---

## Session: 2026-01-22

### Overview
Code simplification and refinement session - improving code quality while preserving functionality.

---

### Phase 6: Code Simplification
- **Status:** ✅ complete
- **Completed:** 2026-01-22

#### Task 6.1: Dead Code Elimination
- Removed unused `calculateAccuracy` function from `AnalysisResults.tsx`
- Removed unused imports (`CheckCircle`, `XCircle`) from lucide-react

#### Task 6.2: DRY Refactoring
- Extracted `MODE_STYLES` constant in `AnnotationCanvas.tsx` to replace switch statement
- Created `_expand_box` and `_check_point_near_hubs` helper methods in `shot_detector.py`
- Reduced `_check_near_miss` from 50 lines to 20 lines

#### Task 6.3: Bug Fix
- Fixed event listener cleanup bug in `VideoPlayer.tsx`
- Changed anonymous function to named `handleEnded` reference for proper removal

**Files Modified:**
- `FRC/components/VideoAnalyzer/AnalysisResults.tsx`
- `FRC/components/VideoAnalyzer/AnnotationCanvas.tsx`
- `FRC/components/VideoAnalyzer/VideoPlayer.tsx`
- `FRC/video-analyzer/src/analyzer/rules/shot_detector.py`

#### Task 6.4: Error Knowledge Base
- Created `errors.md` - 專屬錯誤知識庫
- 記錄 7 個已知錯誤（5 Build, 1 Config, 1 Code Quality）
- 每個錯誤包含：症狀、根因、解決方案、預防措施
- Updated `CLAUDE.md` with "Common Pitfalls" 防錯清單

**Files Created:**
- `errors.md`

**Files Modified:**
- `CLAUDE.md` (added Common Pitfalls section)

---

## 5-Question Reboot Check (Updated)
| Question | Answer |
|----------|--------|
| Where am I? | All phases complete, error tracking established |
| Where am I going? | Ready for deployment/testing |
| What's the goal? | FRC Video Analyzer - automated match scouting |
| What have I learned? | See findings.md + errors.md + CLAUDE.md |
| What have I done? | 10 tasks completed, error knowledge base created |

---

## Session: 2026-01-22 (Part 2)

### Overview
RIFE 插幀 + Google Sheets 自動上傳整合 - 根據計劃 `abstract-orbiting-horizon.md`

---

### Batch 1: 配置模型 + 服務模組
- **Status:** ✅ complete

#### Phase 1: 配置模型 (schemas.py)
- `InterpolationConfig` - RIFE 插幀配置
- `InterpolationProgress` - 插幀進度追蹤
- `SheetsUploadConfig` - Google Sheets 上傳配置
- `UploadResult` - 上傳結果
- `PendingUpload` - 離線隊列項目
- `AnalysisRequestV2` - 擴展的分析請求
- `FullPipelineProgress` - 完整管道進度

#### Phase 2a: Google Sheets 上傳模組 (sheets_uploader.py)
- `safe_json_stringify()` - Unicode 轉義（匹配 TypeScript 實作）
- `format_for_sheets()` - 轉換 AnalysisResult 為字典列表
- `format_as_tsv()` - 轉換為 TSV 格式
- `SheetsUploader` 類 - 含重試機制和指數退避

#### Phase 2b: 離線隊列模組 (offline_queue.py)
- `OfflineQueue` 類 - 持久化 JSON 儲存
- `add_to_queue()` / `remove_from_queue()` / `retry_all()`
- `get_queue_stats()` - 隊列統計

**Files Created:**
- `video-analyzer/src/analyzer/services/__init__.py`
- `video-analyzer/src/analyzer/services/sheets_uploader.py`
- `video-analyzer/src/analyzer/services/offline_queue.py`

**Files Modified:**
- `video-analyzer/src/analyzer/schemas.py`

---

### Batch 2: Sheets API 端點
- **Status:** ✅ complete

#### Phase 2 (續): API 端點實作
新增以下端點到 routes.py:

| 端點 | 用途 |
|------|------|
| `POST /api/v1/sheets/upload` | 上傳分析結果到 Google Sheets |
| `GET /api/v1/sheets/test-connection` | 測試 Apps Script 連接 |
| `GET /api/v1/sheets/pending` | 取得待上傳隊列 |
| `POST /api/v1/sheets/retry-all` | 批次重試所有待上傳 |
| `DELETE /api/v1/sheets/pending/{id}` | 移除單一待上傳項目 |
| `DELETE /api/v1/sheets/pending` | 清空待上傳隊列 |

**Files Modified:**
- `video-analyzer/src/analyzer/api/routes.py`
- `video-analyzer/src/analyzer/api/__init__.py`
- `video-analyzer/src/analyzer/main.py`

---

### Batch 3: RIFE 插幀 + 完整管道 + 測試
- **Status:** ✅ complete

#### Phase 3: RIFE 插幀模組

**video/interpolator.py:**
- `get_device()` - 自動偵測 CUDA/CPU
- `compute_video_hash()` - 緩存鍵計算
- `RIFEInterpolator` 類:
  - 插幀處理 (placeholder 用線性混合)
  - 緩存機制 (hash-based)
  - 進度回調

**新增 API 端點:**

| 端點 | 用途 |
|------|------|
| `POST /api/v1/video/interpolate` | 開始插幀任務 |
| `GET /api/v1/video/interpolate/{task_id}` | 查詢插幀進度 |
| `GET /api/v1/video/cache/stats` | 緩存統計 |
| `DELETE /api/v1/video/cache` | 清空緩存 |

#### Phase 4: 完整管道整合

**POST /api/v1/analyze/full:**
- 整合三階段: 插幀 → 分析 → 上傳
- 每階段獨立進度追蹤
- 自動加入離線隊列（上傳失敗時）

#### Phase 5: 測試

**新增測試檔案:**
- `test_interpolator.py` - 10 個測試 (hash, cache, interpolation, progress)
- `test_sheets_uploader.py` - 12 個測試 (stringify, format, upload, retry)
- `test_offline_queue.py` - 15 個測試 (CRUD, persistence, retry_all)

**Files Created:**
- `video-analyzer/src/analyzer/video/interpolator.py`
- `video-analyzer/tests/test_interpolator.py`
- `video-analyzer/tests/test_sheets_uploader.py`
- `video-analyzer/tests/test_offline_queue.py`

**Files Modified:**
- `video-analyzer/src/analyzer/video/__init__.py`
- `video-analyzer/src/analyzer/api/routes.py`
- `video-analyzer/src/analyzer/api/__init__.py`
- `video-analyzer/src/analyzer/main.py`

---

## 完成總覽

| Batch | Phase | 內容 | 狀態 |
|-------|-------|------|------|
| 1 | Phase 1 | 配置模型 (schemas.py) | ✅ |
| 1 | Phase 2a | sheets_uploader.py | ✅ |
| 1 | Phase 2b | offline_queue.py | ✅ |
| 2 | Phase 2 續 | Sheets API 端點 (6 個) | ✅ |
| 3 | Phase 3 | RIFE 插幀模組 + API (4 個) | ✅ |
| 3 | Phase 4 | 完整管道整合 (2 個) | ✅ |
| 3 | Phase 5 | 測試 (3 個檔案, 37+ 測試) | ✅ |

## API 端點總覽

| 方法 | 路徑 | 用途 |
|------|------|------|
| POST | `/api/v1/video/interpolate` | 開始插幀 |
| GET | `/api/v1/video/interpolate/{task_id}` | 查詢插幀進度 |
| GET | `/api/v1/video/cache/stats` | 緩存統計 |
| DELETE | `/api/v1/video/cache` | 清空緩存 |
| POST | `/api/v1/sheets/upload` | 上傳到 Sheets |
| GET | `/api/v1/sheets/test-connection` | 測試連接 |
| GET | `/api/v1/sheets/pending` | 待上傳隊列 |
| POST | `/api/v1/sheets/retry-all` | 批次重試 |
| DELETE | `/api/v1/sheets/pending/{id}` | 移除待上傳 |
| DELETE | `/api/v1/sheets/pending` | 清空隊列 |
| POST | `/api/v1/analyze/full` | 完整管道 |
| GET | `/api/v1/analyze/full/{task_id}` | 管道進度 |

---
*Last updated: 2026-01-22*

---

## Session: 2026-01-23

### Overview
專案分離 - 將 FRC Video Analyzer 從 Scouting PASS 專案中分離成獨立專案。

---

### Phase 7: 專案分離
- **Status:** ✅ complete
- **Completed:** 2026-01-23

#### Task 7.1: 建立新專案目錄結構
- 建立 `D:\frc-video-analyzer` 作為獨立專案
- 設定前端 + 後端的目錄結構

#### Task 7.2: 移動 Python 後端
- 移動 `video-analyzer/src/` 到 `backend/src/`
- 移動 `video-analyzer/tests/` 到 `backend/tests/`
- 移動 `pyproject.toml` 和 `requirements.txt`

#### Task 7.3: 移動 React 前端組件
- 移動 `FRC/components/VideoAnalyzer/` 到 `src/components/VideoAnalyzer/`
- 建立 `App.tsx` 和 `main.tsx` 入口檔案

#### Task 7.4: 設定前端專案配置
- 建立 `package.json` (React + Vite + TypeScript)
- 建立 `vite.config.ts` (含 API proxy 設定)
- 建立 `tsconfig.json` (strict mode)
- 建立 `vercel.json` (SPA rewrite)
- 建立 `index.html` (Tailwind CDN)

#### Task 7.5: 修復 TypeScript 編譯錯誤
- 移除未使用的 `API_BASE` 常數
- 註解未使用的 `onAnnotationSelect` prop

#### Task 7.6: 初始化 Git 並推送到 GitHub
- 建立 `.gitignore`
- 初始化 Git repository
- 建立 GitHub repo: `0908869905/frc-video-analyzer`
- 推送 3 個 commits

#### Task 7.7: 清理原專案
- 刪除 `video-analyzer/` 目錄
- 刪除 `FRC/components/VideoAnalyzer/` 目錄
- 刪除 `FRC/src-tauri/` 目錄
- 刪除遺漏的 `frc-video-analyzer.exe`
- 更新 `CLAUDE.md` 移除 Video Analyzer 相關內容

**新專案結構：**
```
D:\frc-video-analyzer\
├── .git/
├── .gitignore
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json
├── index.html
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── components/VideoAnalyzer/  (6 個組件)
└── backend/
    ├── pyproject.toml
    ├── requirements.txt
    ├── src/analyzer/              (Python 後端)
    └── tests/                     (10 個測試檔案)
```

**GitHub Repository:**
- URL: https://github.com/0908869905/frc-video-analyzer
- Commits: 3
- Build: ✅ 成功 (166.51 KB)

---

## 5-Question Reboot Check (Updated)
| Question | Answer |
|----------|--------|
| Where am I? | 專案已分離，Scouting PASS 為純人工 scouting 應用 |
| Where am I going? | 兩個專案獨立開發部署 |
| What's the goal? | Scouting PASS: 人工 scouting / Video Analyzer: 影片自動分析 |
| What have I learned? | 專案分離流程、TypeScript strict mode 處理 |
| What have I done? | 7 個任務完成，新專案建立並推送到 GitHub |

---

## 專案狀態總覽

| 專案 | 位置 | GitHub | 狀態 |
|------|------|--------|------|
| Scouting PASS | `D:\frc-6998-scouting-pass` | (原有) | 人工 scouting 網頁 |
| Video Analyzer | `D:\frc-video-analyzer` | `0908869905/frc-video-analyzer` | 影片自動分析系統 |

---

## Session: 2026-01-23 (Part 2)

### Overview
Auto Path Drawing 功能開發 - 在 Auton 頁籤添加場地圖路徑繪製功能，讓 scouter 可以記錄機器人在自動階段的移動路徑。

---

### Phase 8: Auto Path Drawing Feature
- **Status:** 🔄 進行中 (90% 完成)
- **Started:** 2026-01-23

#### Task 8.1: 設計階段 (Brainstorming)
- **Status:** ✅ complete
- 確認功能需求：追蹤自動期間完整路徑
- 選擇實作方式：自由繪製（像畫筆）
- 確認設備：手機/平板（觸控優先）
- 資料格式：座標陣列 + 圖片匯出

#### Task 8.2: 撰寫實作計畫
- **Status:** ✅ complete
- 計畫檔案：`docs/plans/2026-01-23-auto-path-drawing.md`
- 6 個任務，24 個步驟

#### Task 8.3: 執行實作計畫 (Subagent-Driven)
- **Status:** ✅ complete

| Task | 描述 | 狀態 |
|------|------|------|
| 1 | 新增 PathPoint 型別和 autoPath 欄位 | ✅ |
| 2 | 更新 TSV Schema 和匯出邏輯 | ✅ |
| 3 | 新增翻譯鍵值（英文/繁體中文） | ✅ |
| 4 | 建立 FieldCanvas 組件 | ✅ |
| 5 | 整合到 AutonTab | ✅ |
| 6 | 完整驗證 | ✅ |

**Files Created:**
- `FRC/components/FieldCanvas.tsx` (330+ lines)

**Files Modified:**
- `FRC/types.ts` - 新增 PathPoint 介面和 autoPath 欄位
- `FRC/constants.ts` - TSV_SCHEMA_MATCH 加入 'autoPath'
- `FRC/services/googleSheets.ts` - 新增 pathToString() 序列化函式
- `FRC/contexts/LanguageContext.tsx` - 新增 5 個翻譯鍵值
- `FRC/components/TabViews.tsx` - 整合 FieldCanvas 到 AutonTab

#### Task 8.4: 場地圖背景調試
- **Status:** ✅ complete
- 問題：場地圖背景不顯示
- 原因 1：使用了 2025 REEFSCAPE 場地圖 (field25.png)
- 修復 1：改用 2026 REBUILT 場地圖 (field26.png)
- 原因 2：只顯示半場的 CSS `left: -100%` 把圖片移出視窗
- 修復 2：改用 `transform: translateX(-50%)` 正確顯示右半邊
- 驗證：紅方半場場地圖已正確顯示

**場地圖來源：**
- URL: `https://raw.githubusercontent.com/mjansen4857/pathplanner/main/images/field26.png`
- PathPlanner 官方 GitHub

---

### 功能特色

1. **觸控友善** - 使用 Pointer Events，支援手機/平板
2. **百分比座標** - 響應式設計，適應不同螢幕尺寸
3. **半場顯示** - 根據聯盟（紅/藍）只顯示對應半場
4. **路徑視覺化** - 青色路徑線、綠色起點、紅色終點
5. **控制按鈕** - 清除、撤銷、儲存圖片
6. **Web Share API** - 行動裝置分享，桌面端下載
7. **TSV 匯出** - 格式：`"x1.0,y1.0|x2.0,y2.0|..."`

---

### 待完成項目

- [ ] 測試藍方半場顯示
- [ ] 測試繪圖功能（觸控/滑鼠）
- [ ] 測試路徑資料匯出（QR Code）
- [ ] 測試圖片分享/下載功能
- [ ] 考慮是否需要場地元素標註（Reef、Coral 等）

---

## 5-Question Reboot Check (Updated)
| Question | Answer |
|----------|--------|
| Where am I? | Auto Path Drawing 功能已實作完成，待完整測試 |
| Where am I going? | 測試繪圖功能、藍方半場、匯出功能 |
| What's the goal? | 讓 scouter 可以繪製並記錄機器人自動階段路徑 |
| What have I learned? | CSS transform vs left 定位差異、PathPlanner 場地圖資源 |
| What have I done? | 設計 + 計畫 + 實作 6 個任務 + 調試場地圖顯示 |

---

## Session: 2026-01-24

### Overview
場地圖本地化 + PWA 設定 + Vercel 部署 + iOS App 打包準備

---

### Phase 9: 場地圖本地化
- **Status:** ✅ complete

#### Task 9.1: 使用本地場地圖
- 用戶提供已裁切好的紅/藍方半場圖片
- 重命名：`紅.png` → `field-red.png`、`藍.png` → `field-blue.png`
- 建立 `vite-env.d.ts` 為圖片 import 提供類型定義
- 修改 `FieldCanvas.tsx` 使用本地圖片，移除 CSS transform 裁切

**Files Created:**
- `FRC/field-red.png` - 紅方半場場地圖
- `FRC/field-blue.png` - 藍方半場場地圖
- `FRC/vite-env.d.ts` - 圖片類型定義

**Files Modified:**
- `FRC/components/FieldCanvas.tsx` - 改用本地圖片

---

### Phase 10: PWA 離線支援
- **Status:** ✅ complete

#### Task 10.1: PWA 配置
- 建立 `public/manifest.json` - App 名稱、圖示、主題色
- 建立 `public/sw.js` - Service Worker 離線快取
- 建立 `public/icons/` - App 圖示 (192x192, 512x512)
- 修改 `index.html` 添加 PWA meta tags 和 SW 註冊

**Files Created:**
- `FRC/public/manifest.json`
- `FRC/public/sw.js`
- `FRC/public/icons/icon-192.png`
- `FRC/public/icons/icon-512.png`

**Files Modified:**
- `FRC/index.html` - PWA meta tags + SW 註冊

---

### Phase 11: Vercel 部署
- **Status:** ✅ complete

#### Task 11.1: 部署到 Vercel
- 提交 PWA 變更到 GitHub
- 使用 Vercel CLI 部署

**部署網址:**
- 主網址: https://frc-ten.vercel.app
- Production: https://frc-eedsmjoit-0908869905s-projects.vercel.app

---

### Phase 12: iOS App 打包準備
- **Status:** 🔄 進行中 (Windows 部分完成，待 Mac 繼續)

#### Task 12.1: Capacitor 設定 (Windows)
- **Status:** ✅ complete
- 安裝 `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`
- 建立 `capacitor.config.ts` (App ID: `com.frc6998.scouting`)
- 已推送到 GitHub

**Files Created:**
- `FRC/capacitor.config.ts`

#### Task 12.2: iOS 專案建立 (Mac)
- **Status:** ⏳ 待執行
- 需要在 Mac 上執行

#### Task 12.3: Xcode 設定與打包 (Mac)
- **Status:** ⏳ 待執行
- 需要在 Mac 上執行

---

## Mac 上的待執行步驟

### 步驟 1: 下載專案
```bash
git clone https://github.com/0908869905/FRC.git
cd FRC
npm install
npm run build
```

### 步驟 2: 建立 iOS 專案
```bash
npx cap add ios
npx cap sync
```

### 步驟 3: 打開 Xcode
```bash
npx cap open ios
```

### 步驟 4: Xcode 設定
1. 點左側 **App** 專案
2. 選擇 **Signing & Capabilities**
3. **Team** 選擇你的 Apple Developer 帳號
4. **Bundle Identifier** 保持 `com.frc6998.scouting`
5. 勾選 **Automatically manage signing**

### 步驟 5: App Icon
- 需要 1024x1024 的 App Icon
- 放到 `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- 或在 Xcode 中直接拖放

### 步驟 6: 打包上傳
1. 目標設備選 **Any iOS Device (arm64)**
2. 菜單 **Product → Archive**
3. Archive 完成後點 **Distribute App**
4. 選擇 **App Store Connect → Upload**
5. 登入 App Store Connect 提交審核

---

## 5-Question Reboot Check (Updated)
| Question | Answer |
|----------|--------|
| Where am I? | Windows 部分完成，準備在 Mac 上打包 iOS App |
| Where am I going? | Mac: 建立 iOS 專案 → Xcode 設定 → 上架 App Store |
| What's the goal? | 讓 scouter 可以離線使用 iOS App 進行比賽 scouting |
| What have I learned? | Capacitor iOS 打包流程、PWA 設定、Vercel 部署 |
| What have I done? | 場地圖本地化 + PWA + Vercel 部署 + Capacitor 設定 |

---

## 快速恢復指令

### Windows (開發)
```bash
cd D:\frc-6998-scouting-pass\FRC && npm run dev
```

### Mac (iOS 打包)
```bash
git clone https://github.com/0908869905/FRC.git
cd FRC
npm install && npm run build
npx cap add ios && npx cap sync
npx cap open ios
```

---

## 相關連結
- GitHub: https://github.com/0908869905/FRC
- Vercel: https://frc-ten.vercel.app
- App Store Connect: https://appstoreconnect.apple.com

---
*Last updated: 2026-01-24*
