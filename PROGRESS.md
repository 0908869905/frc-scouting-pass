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
- **Status:** ✅ complete (待付費開發者帳號上架)
- **Completed:** 2026-01-24

#### Task 12.1: Capacitor 設定 (Windows)
- **Status:** ✅ complete
- 安裝 `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`
- 建立 `capacitor.config.ts` (App ID: `com.frc6998.scouting`)
- 已推送到 GitHub

**Files Created:**
- `FRC/capacitor.config.ts`

#### Task 12.2: App Icon 生成 (Windows)
- **Status:** ✅ complete
- 使用 Google Nano Banana 生成原始圖標 (4096x4096)
- 用 Python PIL 轉換為所有 iOS 所需尺寸
- 同時更新 PWA 圖標

**圖標特色:**
- 6998 數字為主視覺
- NNKIEH + 國立南科國際實驗高級中學
- 科技/機器人風格、青金色配色

**Files Created:**
- `ios-icons/AppIcon-1024.png` (App Store)
- `ios-icons/AppIcon-*.png` (13 個尺寸: 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024)

**Files Updated:**
- `public/icons/icon-192.png` (PWA)
- `public/icons/icon-512.png` (PWA)

#### Task 12.3: iOS 專案建立 (Mac)
- **Status:** ✅ complete
- **Completed:** 2026-01-24
- 執行 `npx cap add ios` 和 `npx cap sync`
- 複製 App Icon 到 iOS 專案
- Xcode 專案已成功打開

#### Task 12.4: Xcode 設定與打包 (Mac)
- **Status:** ⏳ 待付費開發者帳號
- Apple Developer Program ($99/年) 尚未加入
- iOS 專案已準備好，待付費後即可上架

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

### 步驟 5: App Icon (已準備好)
圖標已在 `ios-icons/` 目錄，執行以下指令複製：
```bash
cp ios-icons/*.png ios/App/App/Assets.xcassets/AppIcon.appiconset/
```
或在 Xcode 中：
1. 打開 `ios/App/App/Assets.xcassets`
2. 點擊 `AppIcon`
3. 拖放 `ios-icons/AppIcon-1024.png` 到 1024pt 格子

### 步驟 6: 打包上傳
1. 目標設備選 **Any iOS Device (arm64)**
2. 菜單 **Product → Archive**
3. Archive 完成後點 **Distribute App**
4. 選擇 **App Store Connect → Upload**
5. 登入 App Store Connect 提交審核

---

### Phase 13: 程式碼簡化
- **Status:** ✅ complete
- **Completed:** 2026-01-24

#### Task 13.1: 死碼清除
- 刪除 `components/ui/InputFields.tsx` - 重複的組件，從未被 import
- 刪除 `services/tbaService.ts` - stub 函數，永遠回傳 null

#### Task 13.2: 程式碼優化
- `FieldCanvas.tsx`: 移除重複的 PathPoint 介面
- `TabViews.tsx`: 移除未使用的 Button import
- `QRCodeTab.tsx`: 簡化冗餘的三元運算式
- `googleSheets.ts`: `any` → 正確型別
- `LanguageContext.tsx`: 移除 @ts-ignore
- 多個檔案: 優化 React import (改用具體 import)

**統計:**
- 刪除 ~250 行死碼
- 優化 10 個檔案
- 淨減少 241 行程式碼

---

## 5-Question Reboot Check (Updated)
| Question | Answer |
|----------|--------|
| Where am I? | Windows 部分全部完成，程式碼已簡化，準備在 Mac 上打包 |
| Where am I going? | Mac: 建立 iOS 專案 → 設定圖標 → Xcode 簽名 → 上架 App Store |
| What's the goal? | 讓 scouter 可以離線使用 iOS App 進行比賽 scouting |
| What have I learned? | Capacitor iOS 打包、PWA 設定、Vercel 部署、iOS 圖標尺寸、程式碼簡化 |
| What have I done? | 場地圖本地化 + PWA + Vercel + Capacitor + App Icon + 程式碼簡化 |

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

### Phase 14: 防呆驗證功能
- **Status:** ✅ complete
- **Completed:** 2026-01-24

#### Task 14.1: 團隊號碼驗證
- **Status:** ✅ complete
- 驗證規則：必須是 1-9999 的整數
- 即時顯示紅色邊框和錯誤訊息（輸入無效值時）
- 阻止進入下一階段

**Files Modified:**
- `App.tsx` - 新增 `validateRequiredFields` 團隊號碼格式檢查
- `components/TabViews.tsx` - PreMatchTab 即時驗證 UI

#### Task 14.2: Auto 起始位置驗證
- **Status:** ✅ complete
- 驗證規則：路徑起點必須在起始區域 (X = 40-60%)
- 視覺提示：半透明綠色區域 + 虛線邊界
- 警告訊息：橘色提示框
- 強制驗證：阻止進入下一階段

**起始區域位置：**
- 起始區域寬度: 20%
- 偏移量: 40% (從左邊緣)
- 有效範圍: X = 40% ~ 60%

**Files Modified:**
- `App.tsx` - 新增 `validateAutoStartPosition` 函數
- `components/FieldCanvas.tsx` - 起始區域視覺化 + 驗證邏輯
- `contexts/LanguageContext.tsx` - 新增翻譯鍵 (teamNumberInvalid, autoStartWarning, startingZone)

#### 驗證流程總覽

| 階段轉換 | 驗證項目 | 不通過時 |
|---------|---------|---------|
| PreMatch → Auton | 必填欄位 + 隊號格式 (1-9999) | 顯示錯誤，停留 PreMatch |
| Auton → Teleop | 起始位置 (如有路徑) | 顯示警告，停留 Auton |
| 進入 QRCode | 全部驗證 | 跳回對應階段 |

---

## 5-Question Reboot Check (Updated)
| Question | Answer |
|----------|--------|
| Where am I? | 全部功能完成，iOS 專案已建立，待上架 |
| Where am I going? | 付費 Apple Developer → 上架 App Store |
| What's the goal? | FRC 6998 比賽 scouting 應用 |
| What have I learned? | Capacitor iOS 打包、PWA、防呆驗證 |
| What have I done? | Web App + PWA + iOS 專案 + 防呆驗證 |

---

## 目前可用的部署方式

| 方式 | 狀態 | 網址/說明 |
|------|------|----------|
| Web App | ✅ 可用 | https://frc-ten.vercel.app |
| PWA | ✅ 可用 | Safari → 分享 → 加入主畫面 |
| iOS App Store | ⏳ 待付費 | 需 Apple Developer Program ($99/年) |

---

## 之後上架 App Store 步驟

1. 加入 Apple Developer Program
2. 在 Mac 執行：
   ```bash
   cd ~/Desktop/FRC
   npx cap open ios
   ```
3. Xcode: Signing & Capabilities → 選付費帳號
4. Product → Archive → Distribute App → App Store Connect

---

## Session: 2026-01-25

### Overview
2026 REBUILT 遊戲規則全面重構 - 更新表單欄位以符合新賽季規則。

---

### Phase 15: 2026 REBUILT 表單重構
- **Status:** ✅ complete
- **Completed:** 2026-01-25

#### Task 15.1: 類型定義更新 (types.ts)
- 新增 `Alliance` 類型: `'Red' | 'Blue'`
- 新增 `AutoClimbStatus` enum: `None | Level1 | Failed`
- 新增 `TeleClimbStatus` enum: `None | Level1 | Level2 | Level3 | Failed`
- 更新 `ScoutingData` 介面，新增/移除欄位
- 更新 `INITIAL_DATA` 預設值

#### Task 15.2: 常數更新 (constants.ts)
- 更新 `TSV_SCHEMA_MATCH` 欄位 (移除 autoPath)
- 新增 `TSV_SCHEMA_PATH` (路徑專用 schema)
- 新增 `ALLIANCE_OPTIONS`, `AUTO_CLIMB_OPTIONS`, `TELE_CLIMB_OPTIONS`

#### Task 15.3: 翻譯更新 (LanguageContext.tsx)
- 新增所有新欄位的翻譯鍵 (英文/繁體中文)
- 新增 Stopwatch 相關翻譯

#### Task 15.4: 表單組件更新 (TabViews.tsx)
- PreMatchTab: `robotPosition` (6選項) → `alliance` (2選項)
- AutonTab: 新增 autoClimbStatus 選擇器 + Stopwatch
- TeleopTab: 新增 teleClimbStatus, bumpTrenchCount, fuelDroppedOnBump + Stopwatch
- 新增 PenaltyTab 組件
- PostMatchTab: 新增 almostTipped, ridingOnBall, subjectiveNotes

#### Task 15.5: Stopwatch 組件
- 建立 Stopwatch 組件 (碼表 UI)
- 精度: 0.01 秒 (小數點後兩位)
- 功能: Start/Stop/Reset
- 支援 accentColor prop

#### Task 15.6: QR Code 分離 (QRCodeTab.tsx)
- Match Data QR (青色) - 所有比賽數據，不含路徑
- Auto Path QR (琥珀色) - eventCode, matchNumber, teamNumber, autoPath
- 各自有「顯示標籤」和「複製 TSV」功能

#### Task 15.7: TSV 生成更新 (googleSheets.ts)
- 新增 `generatePathTSV()` 函數
- 更新 `generateTSV()` 排除 autoPath

**移除的欄位:**
- `robotPosition` → `alliance`
- `autoLeave`, `autoTowerLevel1`, `teleTower`
- `tippedOver` → `almostTipped`
- `defendedBy`, `tags`

**新增的欄位:**
- `alliance`, `autoClimbStatus`, `autoClimbTime`
- `teleClimbStatus`, `teleClimbTime`, `bumpTrenchCount`, `fuelDroppedOnBump`
- `penaltyCount`, `yellowCard`, `redCard`
- `almostTipped`, `ridingOnBall`, `subjectiveNotes`

---

## 5-Question Reboot Check (Updated)
| Question | Answer |
|----------|--------|
| Where am I? | 2026 REBUILT 重構完成，雙 QR Code 功能實作完畢 |
| Where am I going? | 測試所有新功能、部署更新版本 |
| What's the goal? | FRC 6998 Scouting PASS - 2026 REBUILT 賽季 |
| What have I learned? | 分離 QR Code 減少複雜度、Stopwatch 組件設計 |
| What have I done? | 7 個任務完成，表單全面重構 |

---

## Session: 2026-01-28

### Overview
Teleop UI 優化 + 犯規機制調整 + 攀爬選項簡化

---

### Phase 16: Teleop 與攀爬欄位優化
- **Status:** ✅ complete
- **Completed:** 2026-01-28

#### Task 16.1: Teleop 順序調整
- 攀爬狀態移到最後：Bump → Fuel → Penalty → Climb
- 更符合比賽實際順序（攀爬通常在最後進行）

#### Task 16.2: 犯規計數器化
- `minorPenalty`: boolean → number (Counter 組件)
- `majorPenalty`: boolean → number (Counter 組件)
- 移除 `penaltyCount` 欄位（用 minor + major 取代）

#### Task 16.3: 攀爬選項簡化
- **刪除 `ClimbSide` enum**（原: Left | Right | Center）
- **更新 `ClimbPosition`**: 5 個選項
  - LeftSide | Left | Center | Right | RightSide
- **移除欄位**: `autoClimbSide`, `teleClimbSide`
- 攀爬側資訊現整合於 ClimbPosition

#### Task 16.4: TSV Schema 更新
- 現為 **18 個欄位**（移除 penaltyCount、攀爬側相關欄位）

**Files Modified:**
- `types.ts` - 資料結構更新
- `constants.ts` - TSV schema 更新
- `components/TabViews.tsx` - UI 元件調整
- `contexts/LanguageContext.tsx` - 新增翻譯鍵

---

### 完成項目
- [x] Teleop 順序調整（攀爬移到最後）
- [x] 犯規計數器化（minor/major 改為 number）
- [x] 移除 penaltyCount（用 minor+major 取代）
- [x] 簡化攀爬選項（刪除 ClimbSide，ClimbPosition 改為 5 選項）
- [x] 移除 autoClimbSide 和 teleClimbSide 欄位
- [x] TSV Schema 更新（18 欄位）

### 修改檔案
- `types.ts` - 資料結構（ClimbPosition enum、ScoutingData interface）
- `constants.ts` - TSV_SCHEMA_MATCH（18 欄位）
- `components/TabViews.tsx` - TeleopTab UI 順序與犯規計數器
- `contexts/LanguageContext.tsx` - ClimbPosition 翻譯

---

## 5-Question Reboot Check

1. **做什麼？** Teleop UI 優化、犯規機制調整、攀爬選項簡化
2. **進度？** ✅ 全部完成
3. **下一步？** 測試完整表單流程、部署更新版本
4. **阻礙？** 無
5. **檔案？** `types.ts`, `constants.ts`, `TabViews.tsx`, `LanguageContext.tsx`

---
*Last updated: 2026-01-28*

---

## Session: 2026-01-30

### Overview
場地圖更新 + FieldCanvas 路徑比例對齊 Scanner App

---

### Phase 17: 場地圖與路徑渲染優化
- **Status:** ✅ complete
- **Completed:** 2026-01-30

#### Task 17.1: 場地圖更新
- 將 `field26.png` 替換為官方 2026 REBUILT 場地圖
- 來源：`C:\Users\USER\Downloads\FE-2026-_REBUILT_Playing_Field_With_Background.png`

#### Task 17.2: FieldCanvas 路徑比例對齊 Scanner App
- 研究了 `D:\frc-scout-scanner\src\pages\PathViewerPage.tsx` 的 SVG 渲染邏輯
- Scanner 使用 SVG viewBox `0 0 200 100`，container `aspectRatio: '2/1'`，`object-fill`
- 修改 `FieldCanvas.tsx` 使路徑繪製比例完全匹配 scanner：
  - `object-cover` → `object-fill`（圖片拉伸填滿）
  - 線寬：固定 6px → `height × 1.5%`（等比例）
  - 線條透明度：1.0 → 0.9
  - 起點：r=10 綠色 → r=`h×2%` 青色填充+白色邊框
  - 終點：r=10 紅色 → r=`h×2%` 白色填充+青色邊框
  - 新增中間點：r=`h×1%`，青色，opacity=0.7
  - 邊框線寬：固定 2px → `h×0.5%`
- 新增常數：`PATH_COLOR`, `LINE_WIDTH_RATIO`, `POINT_RADIUS_RATIO`, `POINT_STROKE_RATIO`, `MID_POINT_RADIUS_RATIO`

**Files Modified:**
- `FRC/components/FieldCanvas.tsx` - 路徑繪製比例對齊 scanner
- `FRC/field26.png` - 替換為官方 2026 REBUILT 場地圖（紅/藍方各一張）

---

### 完成項目
- [x] 替換場地圖為官方 2026 REBUILT 版本
- [x] 研究 scanner app PathViewerPage.tsx 的渲染邏輯
- [x] FieldCanvas 路徑繪製比例對齊 scanner app
- [x] 新增路徑渲染常數（PATH_COLOR 等）
- [x] 提交並推送兩個 commit

### 修改檔案
- `FRC/components/FieldCanvas.tsx` - 路徑繪製比例重構，對齊 scanner app
- `FRC/field26.png` - 官方 2026 REBUILT 場地圖

### Git Commits
- `5e482cd` - `chore: update field image to official 2026 REBUILT playing field`
- `640f851` - `fix: match FieldCanvas path proportions to scanner app`

---

## 5-Question Reboot Check

1. **做什麼？** 場地圖更新 + FieldCanvas 路徑比例對齊 Scanner App
2. **進度？** ✅ 全部完成
3. **下一步？** 測試路徑繪製在不同螢幕尺寸的顯示效果、驗證 scanner 讀取後路徑一致
4. **阻礙？** 無
5. **檔案？** `FRC/components/FieldCanvas.tsx`, `D:\frc-scout-scanner\src\pages\PathViewerPage.tsx`

---
*Last updated: 2026-01-30*

---

## Session: 2026-02-01

### Overview
App Store 上架準備 Phase 1-5（Windows 端）— 移除所有 CDN 依賴，改為本地 build，強化 Capacitor native 體驗，新增 Privacy Policy。

---

### Phase 18: Tailwind CSS CDN → 本地 Build
- **Status:** ✅ complete

#### Task 18.1: Tailwind 本地化
- 安裝 `tailwindcss` + `@tailwindcss/vite` (devDependencies)
- 新增 `styles.css` — `@import "tailwindcss"` + `@theme` 品牌色定義 + 動畫類別 + `.no-scrollbar`
- 修改 `vite.config.ts` — 加入 `tailwindcss()` plugin
- 修改 `index.tsx` — `import './styles.css'`
- 修改 `index.html` — 移除 Tailwind CDN script、tailwind.config、.no-scrollbar style、esm.sh importmap

**Files Created:**
- `FRC/styles.css`

**Files Modified:**
- `FRC/vite.config.ts` - 加入 tailwindcss() plugin
- `FRC/index.tsx` - import styles.css
- `FRC/index.html` - 移除所有 CDN 引用

---

### Phase 19: Google Fonts → 本地字體
- **Status:** ✅ complete

#### Task 19.1: 字體本地化
- 安裝 `@fontsource/inter` + `@fontsource/orbitron`
- 修改 `index.tsx` — 加入 6 個字體 weight CSS import
- Google Fonts CDN 連結已在 Phase 18 一併清除

**Files Modified:**
- `FRC/index.tsx` - 加入 @fontsource import

---

### Phase 20: Capacitor Native 強化
- **Status:** ✅ complete

#### Task 20.1: Native 插件整合
- 安裝 `@capacitor/splash-screen` + `@capacitor/status-bar` + `@capacitor/haptics`
- 修改 `index.html` — SW 註冊加入 `!window.Capacitor` 判斷（避免 native app 重複註冊）
- 修改 `capacitor.config.ts` — 加入 `plugins` 設定 (SplashScreen + StatusBar)
- 修改 `components/TabViews.tsx` — Counter 遞增/遞減時觸發 `Haptics.impact()`

**Files Modified:**
- `FRC/index.html` - SW 註冊 Capacitor 判斷
- `FRC/capacitor.config.ts` - plugins 設定
- `FRC/components/TabViews.tsx` - Haptics 觸覺回饋

---

### Phase 21: Privacy Policy
- **Status:** ✅ complete

#### Task 21.1: 隱私政策頁面
- 新增完整隱私政策頁面，符合 App Store 審核要求

**Files Created:**
- `FRC/public/privacy.html`

---

### Phase 22: 最終驗證
- **Status:** ✅ complete

#### Task 22.1: Build 驗證
- `npm run build` 成功
- `dist/index.html` 無任何 CDN 引用
- CSS bundle: 52.69 KB
- JS bundle: 231.81 KB
- 字體檔案正確打包到 dist

---

### 完成項目
- [x] Tailwind CSS CDN → 本地 build (`tailwindcss` + `@tailwindcss/vite`)
- [x] Google Fonts CDN → 本地字體 (`@fontsource/inter` + `@fontsource/orbitron`)
- [x] Capacitor native 強化 (SplashScreen + StatusBar + Haptics)
- [x] Service Worker 加入 Capacitor 判斷
- [x] Privacy Policy 頁面
- [x] Build 驗證通過，零 CDN 依賴

### 修改檔案
- `FRC/styles.css` - 新增，Tailwind 主入口 + 品牌色 + 動畫
- `FRC/vite.config.ts` - 加入 tailwindcss() plugin
- `FRC/index.tsx` - import styles.css + @fontsource 字體
- `FRC/index.html` - 移除所有 CDN、加入 Capacitor SW 判斷
- `FRC/capacitor.config.ts` - plugins 設定 (SplashScreen + StatusBar)
- `FRC/components/TabViews.tsx` - Haptics 觸覺回饋
- `FRC/public/privacy.html` - 新增，隱私政策

### 尚未完成
- [ ] Git commit & push 今天的變更
- [ ] Phase 6: Mac 端 iOS 建置與 App Store 提交

---

## 5-Question Reboot Check

1. **做什麼？** App Store 上架準備 — 移除 CDN、本地 build、native 強化、Privacy Policy
2. **進度？** Windows 端 Phase 1-5 全部完成，尚未 commit/push
3. **下一步？** git commit & push → Mac 端 iOS 建置 → App Store 提交
4. **阻礙？** Mac 端操作（iOS build + Xcode + App Store Connect）
5. **檔案？** `styles.css`, `vite.config.ts`, `index.tsx`, `index.html`, `capacitor.config.ts`, `TabViews.tsx`, `public/privacy.html`

---

## 目前部署狀態

| 方式 | 狀態 | 說明 |
|------|------|------|
| Web App | ✅ 可用 | https://frc-ten.vercel.app |
| PWA | ✅ 可用 | Safari → 分享 → 加入主畫面 |
| iOS App Store | 🔄 進行中 | Windows 端準備完成，待 Mac 端建置上架 |

---
*Last updated: 2026-02-01*

---

## Session: 2026-02-02

### Overview
Scouting Pass 表單欄位調整 + TSV Schema 更新 + 起始區域校準 + 防呆驗證放寬

---

### Phase 23: 表單欄位與驗證調整
- **Status:** ✅ complete
- **Completed:** 2026-02-02

#### Task 23.1: 隊號上限移除
- **Status:** ✅ complete
- 移除 team number 1-9999 限制，改為正整數驗證（> 0 的整數）
- 原因：部分 FRC 隊號超過 9999

**Files Modified:**
- `App.tsx` - 移除 9999 上限檢查
- `components/TabViews.tsx` - 移除 9999 即時驗證
- `contexts/LanguageContext.tsx` - 更新驗證錯誤訊息文字

#### Task 23.2: 起始區域 Offset 調整
- **Status:** ✅ complete
- 多次調整 starting zone offset，最終校準值：
  - Red = 25%
  - Blue = 68%
  - Width = 3.5%

**Files Modified:**
- `constants.ts` - 更新 `RED_STARTING_ZONE_OFFSET`, `BLUE_STARTING_ZONE_OFFSET`
- `components/FieldCanvas.tsx` - 起始區域 offset 註解更新

#### Task 23.3: Header 顯示隊號
- **Status:** ✅ complete
- 左上角 header subtitle 行新增 `#teamNumber` 顯示
- 讓 scouter 隨時確認正在記錄哪支隊伍

**Files Modified:**
- `App.tsx` - header subtitle 新增隊號

#### Task 23.4: 攀爬 None 重置
- **Status:** ✅ complete
- 當 climb status 改為 None 時，自動重置 time=0 和 position=Center
- 避免無效的攀爬資料殘留

**Files Modified:**
- `components/TabViews.tsx` - climb status onChange 邏輯

#### Task 23.5: Bump/Trench 分離
- **Status:** ✅ complete
- `bumpTrenchCount` 拆分為 `bumpCount` + `trenchCount` 兩個獨立計數器
- 原因：Bump 和 Trench 是不同的場地動作，分開記錄更精確

**Files Modified:**
- `types.ts` - `bumpTrenchCount` → `bumpCount` + `trenchCount`
- `constants.ts` - TSV schema 更新
- `components/TabViews.tsx` - 分離計數器 UI
- `contexts/LanguageContext.tsx` - 翻譯更新

#### Task 23.6: 翻譯修正
- **Status:** ✅ complete
- "Riding on Ball" → "Riding on Fuel" / "騎在 Fuel 上"

**Files Modified:**
- `contexts/LanguageContext.tsx` - 翻譯文字修正

#### Task 23.7: TSV Schema 更新
- **Status:** ✅ complete
- `TSV_SCHEMA_PATH`: 4 欄位 → 5 欄位（加入 alliance）
- `TSV_SCHEMA_MATCH`: 20 欄位 → 21 欄位（bump/trench 分離）

**Files Modified:**
- `constants.ts` - TSV schema 欄位更新

---

### 完成項目
- [x] 移除 team number 9999 上限，改為正整數驗證
- [x] 起始區域 offset 校準 (Red=25%, Blue=68%, Width=3.5%)
- [x] Header 左上角顯示 #teamNumber
- [x] Climb None 自動重置 time=0, position=Center
- [x] bumpTrenchCount 拆分為 bumpCount + trenchCount
- [x] "Riding on Ball" → "Riding on Fuel" 翻譯修正
- [x] TSV_SCHEMA_PATH 加入 alliance (4→5 欄位)
- [x] TSV_SCHEMA_MATCH bump/trench 分離 (20→21 欄位)

### 修改檔案
- `App.tsx` - header 顯示隊號、移除 9999 上限
- `types.ts` - bumpTrenchCount → bumpCount + trenchCount
- `constants.ts` - TSV schema 更新 (match 21, path 5)、起始區域 offset 調整
- `components/TabViews.tsx` - 分離計數器、climb None 重置、移除 9999 驗證
- `components/FieldCanvas.tsx` - 起始區域 offset 註解更新
- `contexts/LanguageContext.tsx` - 翻譯更新 (bump/trench 分離、Riding on Fuel、隊號驗證訊息)
- `CLAUDE.md` - 文件同步更新

### Git Commits
- `f77b7c7` - feat: remove CDN dependencies, add native plugins, remove team number cap
- `1659477` - feat: header team number, split bump/trench, fix climb reset, update schemas

---

## 5-Question Reboot Check

1. **做什麼？** Scouting Pass 表單欄位微調 + TSV Schema 更新 + 驗證規則調整
2. **進度？** ✅ 全部完成
3. **下一步？** 測試完整表單流程、驗證 scanner app 讀取新 TSV 格式、部署更新版本
4. **阻礙？** 無
5. **檔案？** `App.tsx`, `types.ts`, `constants.ts`, `TabViews.tsx`, `FieldCanvas.tsx`, `LanguageContext.tsx`

---
*Last updated: 2026-02-02*

---

## Session: 2026-02-03

### Overview
起始區域 offset 校準 — 紅藍方各往外移一格

---

### Phase 24: 起始區域微調
- **Status:** ✅ complete
- **Completed:** 2026-02-03

#### Task 24.1: 紅方起始區域往右一格
- RED_STARTING_ZONE_OFFSET: 25 → 28.5%
- 中間步驟，後被 Task 24.2 覆蓋

#### Task 24.2: 紅藍方各往外一格
- Red: 28.5 → 25%（往左，遠離中心）
- Blue: 68 → 71.5%（往右，遠離中心）
- 最終值：Red=25%, Blue=71.5%, Width=3.5%

---

### 完成項目
- [x] 紅方起始區域 offset 調整 (25→28.5→25%)
- [x] 藍方起始區域 offset 調整 (68→71.5%)

### 修改檔案
- `constants.ts` - 起始區域 offset (Red=25%, Blue=71.5%)

### Git Commits
- `9949f56` - fix: shift red starting zone offset right by one grid (25→28.5%)
- `7b8c7e6` - fix: shift starting zones outward by one grid (Red 28.5→25%, Blue 68→71.5%)

---

## 5-Question Reboot Check

1. **做什麼？** 起始區域 offset 校準
2. **進度？** ✅ 全部完成
3. **下一步？** 測試完整表單流程、驗證起始區域位置正確、部署更新版本
4. **阻礙？** 無
5. **檔案？** `constants.ts`, `components/FieldCanvas.tsx`, `App.tsx`

---
*Last updated: 2026-02-03*

---

## Session: 2026-02-04

### Overview
Match Number 自動遞增 + Path QR Code Douglas-Peucker 壓縮

---

### Phase 25: Match Number 自動遞增
- **Status:** ✅ complete
- **Completed:** 2026-02-04

#### Task 25.1: 移除 Quals 條件限制
- 修改 `App.tsx` 的 `handleReset`，移除 `matchLevel === Quals` 條件
- 所有 matchLevel 模式（Quals、Playoffs、Finals 等）reset 後 matchNumber 都會自動 +1
- 使用 Playwright 實測驗證功能正常

---

### Phase 26: Path QR Code 壓縮
- **Status:** ✅ complete
- **Completed:** 2026-02-04

#### Task 26.1: Douglas-Peucker 路徑簡化演算法
- 在 `services/googleSheets.ts` 加入 Douglas-Peucker 路徑簡化演算法
- 整數座標取代浮點數（`Math.round()`）
- 壓縮效果：61 點 → 11 點，628 字元 → 84 字元（約 87% 減少）
- 新增 `simplifyPath` export 函數
- Scanner app 不需改動，格式仍為 `x,y|x,y|...`

---

### Phase 24.3: CLAUDE.md 修正
- **Status:** ✅ complete
- 更新 Blue starting zone offset 從 68 到 71.5%，與 `constants.ts` 實際值一致

---

### 完成項目
- [x] handleReset matchNumber 自動 +1（移除 Quals 條件限制）
- [x] Douglas-Peucker 路徑簡化演算法實作
- [x] 整數座標壓縮（浮點數 → Math.round）
- [x] QR 路徑數據約 87% 減少（628 → 84 字元）
- [x] simplifyPath export 函數
- [x] CLAUDE.md Blue offset 修正 (68 → 71.5%)

### 修改檔案
- `App.tsx` - handleReset matchNumber 自動 +1（移除 Quals 條件）
- `services/googleSheets.ts` - Douglas-Peucker 路徑簡化 + 整數座標 + simplifyPath export
- `CLAUDE.md` - 修正 Blue starting zone offset (68 → 71.5%)

### Git Commits
- `5a90413` - feat: auto-increment match number on reset, compress path QR with Douglas-Peucker

---

## 5-Question Reboot Check

1. **做什麼？** Match Number 自動遞增（所有模式）+ Path QR Code Douglas-Peucker 壓縮（87% 減少）
2. **進度？** ✅ 全部完成
3. **下一步？** 測試不同路徑複雜度下的壓縮效果、驗證 scanner app 正確解析簡化路徑、部署更新版本
4. **阻礙？** 無
5. **檔案？** `App.tsx`, `services/googleSheets.ts`, `CLAUDE.md`

---
*Last updated: 2026-02-04*

---

## Session: 2026-02-05

### Overview
Stopwatch 碼表修復 — 修復 Teleop 碼表數字重疊問題

---

### Phase 27: Stopwatch 視覺修復
- **Status:** ✅ complete
- **Completed:** 2026-02-05

#### Task 27.1: 修復碼表數字重疊問題
- **問題**: 用戶反應 Teleop 碼表「原始的秒數會留在底層，新的秒數會在上層」（兩層數字重疊）
- **原因**: `animate-pulse` 動畫與高頻更新（每 10ms）產生視覺衝突
  - `animate-pulse` 動畫週期約 2 秒，包含 opacity 和 scale 變化
  - 碼表每 10ms 更新一次數字，DOM 重繪與動畫變換疊加造成殘影
- **解決**: 移除時間數字上的 `animate-pulse`，改用獨立的紅色閃爍圓點作為運行指示器

---

### 完成項目
- [x] 修復 Stopwatch 碼表數字重疊問題
- [x] 移除時間數字上的 `animate-pulse` 動畫
- [x] 新增獨立的紅色閃爍圓點作為運行狀態指示器

### 修改檔案
- `components/TabViews.tsx` - Stopwatch 組件視覺修復

### Git Commits
- `b98c566` - fix: remove animate-pulse from Stopwatch to prevent double-digit overlay
- `16a286d` - docs: update documentation for 2026-02-04 session

---

## 5-Question Reboot Check

1. **做什麼？** 修復 Stopwatch 碼表數字重疊的視覺問題
2. **進度？** ✅ 已完成，已 push 到 GitHub
3. **下一步？** 無明確後續，可進行其他功能開發或測試
4. **阻礙？** 無
5. **檔案？** `components/TabViews.tsx`

---
*Last updated: 2026-02-05*

---

## Session: 2026-02-05 (Part 2)

### Overview
Scouting PASS 8 項 UX 改進功能實作 — 震動確認、自動保存、Scouter 名稱記憶、比賽計時、滑動手勢、TBA 資料、歷史記錄編輯

---

### Phase 28: UX 改進 Batch 1 — 基礎 UX
- **Status:** ✅ complete

#### Task 28.1: 震動確認提交
- 提交 QR Code 時觸發震動回饋
- 建立 `utils/haptics.ts` 提供統一觸覺 API
- 修改 `QRCodeTab.tsx` 在提交時呼叫

#### Task 28.2: 自動保存指示器
- 建立 `components/ui/AutoSaveIndicator.tsx`
- 顯示「已自動保存」時間戳
- 整合到 `App.tsx` 追蹤 lastSaveTime

#### Task 28.3: 常用 Scouter 名稱記憶
- 建立 `hooks/useRecentScouters.ts` (localStorage: `recent_scouters`)
- 建立 `components/ui/ScouterNameInput.tsx` — 下拉選單顯示最近 3 個名稱
- 整合到 PreMatchTab

#### Task 28.4: 比賽時間提示
- 建立 `components/ui/PhaseTimeIndicator.tsx`
- 顯示 Auto (15 秒) / Teleop (2:15) 倒數計時
- Settings 新增開關 (localStorage: `match_timer_enabled`)

---

### Phase 29: UX 改進 Batch 2 — 滑動手勢導航
- **Status:** ✅ complete

#### Task 29.1: 滑動手勢導航
- 建立 `hooks/useSwipeNavigation.ts`
- 左滑 → 下一階段、右滑 → 上一階段
- `FieldCanvas.tsx` 新增 `data-swipe-ignore` 屬性排除繪圖區

---

### Phase 30: UX 改進 Batch 3 — TBA 資料內建
- **Status:** ✅ complete

#### Task 30.1: 內建賽程資料
- 建立 `data/events2026.ts` — 2026 賽事列表
- 建立 `data/eventSchedule.ts` — 賽程 schema + 示範資料

#### Task 30.2: 賽事代碼下拉選單
- 建立 `components/ui/EventCodeSelect.tsx`
- 可搜尋的 Event Code 選擇器

#### Task 30.3: 快速隊伍切換按鈕
- 建立 `components/ui/QuickTeamSelect.tsx`
- 根據賽程顯示當場比賽 6 支隊伍按鈕

---

### Phase 31: UX 改進 Batch 4 — 歷史記錄編輯
- **Status:** ✅ complete

#### Task 31.1: 批量編輯歷史記錄
- 建立 `components/HistoryEditForm.tsx` — 編輯表單
- 擴展 `HistoryModal.tsx` — 新增編輯功能入口
- `storage.ts` 新增 `updateMatchRecord`, `getMatchRecord` 函數

---

### 完成項目
- [x] 震動確認提交 (`utils/haptics.ts` + `QRCodeTab.tsx`)
- [x] 自動保存指示器 (`components/ui/AutoSaveIndicator.tsx` + `App.tsx`)
- [x] 常用 Scouter 名稱記憶 (`hooks/useRecentScouters.ts` + `components/ui/ScouterNameInput.tsx`)
- [x] 比賽時間提示 (`components/ui/PhaseTimeIndicator.tsx` + Settings)
- [x] 滑動手勢導航 (`hooks/useSwipeNavigation.ts` + `FieldCanvas.tsx` 排除)
- [x] 內建賽程資料 (`data/events2026.ts` + `data/eventSchedule.ts`)
- [x] 賽事代碼下拉選單 (`components/ui/EventCodeSelect.tsx`)
- [x] 快速隊伍切換按鈕 (`components/ui/QuickTeamSelect.tsx`)
- [x] 批量編輯歷史記錄 (`components/HistoryEditForm.tsx` + `HistoryModal.tsx` + `storage.ts`)

### 新增檔案
- `FRC/utils/haptics.ts` - 觸覺回饋 API
- `FRC/hooks/useSwipeNavigation.ts` - 滑動手勢 hook
- `FRC/hooks/useRecentScouters.ts` - 最近 scouter 記憶 hook
- `FRC/data/events2026.ts` - 2026 賽事列表
- `FRC/data/eventSchedule.ts` - 賽程 schema + 示範資料
- `FRC/components/ui/AutoSaveIndicator.tsx` - 自動保存指示器
- `FRC/components/ui/ScouterNameInput.tsx` - Scouter 名稱輸入 + 下拉選單
- `FRC/components/ui/PhaseTimeIndicator.tsx` - 比賽階段計時器
- `FRC/components/ui/EventCodeSelect.tsx` - 賽事代碼選擇器
- `FRC/components/ui/QuickTeamSelect.tsx` - 快速隊伍切換
- `FRC/components/HistoryEditForm.tsx` - 歷史記錄編輯表單

### 修改檔案
- `FRC/App.tsx` - lastSaveTime 狀態、滑動手勢、showMatchTimer 設定
- `FRC/components/TabViews.tsx` - 整合新 UI 組件
- `FRC/components/QRCodeTab.tsx` - 觸覺回饋
- `FRC/components/HistoryModal.tsx` - 編輯功能
- `FRC/components/FieldCanvas.tsx` - data-swipe-ignore 屬性
- `FRC/services/storage.ts` - updateMatchRecord, getMatchRecord 函數
- `FRC/contexts/LanguageContext.tsx` - ~25 個新翻譯鍵

### localStorage Keys (新增)
| Key | 用途 |
|-----|------|
| `recent_scouters` | 最近 3 個 scouter 名稱 |
| `match_timer_enabled` | 計時器開關 |

### 錯誤修正
| 錯誤 | 解決方案 |
|------|----------|
| `CloudCheck` 圖示不存在 | 改用 `Cloud` 圖示 |
| `Alliance` 重複 import | 移除重複的 import 行 |

### 待辦事項
- [ ] TBA API 需要有效的 API Key 才能取得真實賽程資料
- [ ] `data/eventSchedule.ts` 是示範資料，當 2026 賽程公布時需要更新

---

## 5-Question Reboot Check

1. **做什麼？** 實作 Scouting PASS 8 項 UX 改進功能
2. **進度？** ✅ 全部完成（11 個新檔案、7 個修改檔案、~25 個翻譯鍵）
3. **下一步？** 等 2026 賽程公布後更新 `data/eventSchedule.ts`、取得 TBA API Key
4. **阻礙？** TBA API 需要 API Key
5. **檔案？** `utils/haptics.ts`, `hooks/useSwipeNavigation.ts`, `hooks/useRecentScouters.ts`, `data/events2026.ts`, `components/ui/*.tsx`, `components/HistoryEditForm.tsx`

---
*Last updated: 2026-02-05*
