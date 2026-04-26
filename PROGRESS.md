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

---

## Session: 2026-02-09

### Overview
全螢幕場地圖修復 — 修復尺寸計算時機不可靠、z-index 被父層覆蓋、碼錶不顯示三個問題。

---

### Phase 32: 全螢幕場地圖修復
- **Status:** ✅ complete
- **Completed:** 2026-02-09

#### Task 32.1: 修復全螢幕尺寸計算
- **問題**: 之前用 `fullscreenRef` + double `requestAnimationFrame` 量測 DOM 尺寸，時機不可靠導致手機顯示異常
- **解決**: 在點擊全螢幕按鈕時直接用 `window.innerWidth/Height` 算好尺寸，確保第一次渲染就正確
- **移除**: `fullscreenRef`（不再需要 DOM 量測）

#### Task 32.2: 用 React Portal 修復 z-index 問題
- **問題**: 全螢幕 overlay 渲染在 `<main>` 內部（有 `overflow-y-auto`），受父層 stacking context 影響，header 和 footer（Next/Prev 按鈕）仍顯示在全螢幕之上
- **解決**: 改用 `createPortal(overlay, document.body)` 直接渲染到 body，跳出父層 stacking context

#### Task 32.3: 碼錶永遠顯示
- **問題**: `onClimbTimeChange` 只在 `autoClimbStatus !== None` 時才傳入 FieldCanvas，導致全螢幕碼錶不顯示
- **解決**: 永遠傳入 `climbTime` 和 `onClimbTimeChange`，不受 autoClimbStatus 限制

---

### 完成項目
- [x] 修復全螢幕尺寸計算 — 改用 `window.innerWidth/Height` 直接計算
- [x] 用 React Portal 渲染全螢幕 overlay 到 `document.body`
- [x] 全螢幕碼錶永遠顯示，不受 autoClimbStatus 限制

### 修改檔案
- `FRC/components/FieldCanvas.tsx` - 移除 fullscreenRef、改用 window 直接計算尺寸、用 createPortal 渲染到 document.body
- `FRC/components/TabViews.tsx` - FieldCanvas 的 climbTime/onClimbTimeChange 永遠傳入

### Git Commits
- `3d57274` - fix: 修復全螢幕場地圖尺寸計算 - 改用 window 直接計算
- `708f48f` - fix: 用 React Portal 渲染全螢幕 overlay 到 document.body
- `ef887d1` - fix: 全螢幕碼錶永遠顯示，不受 autoClimbStatus 限制

---

## 5-Question Reboot Check

1. **做什麼？** 修復全螢幕場地圖三個問題（尺寸計算、z-index、碼錶顯示）
2. **進度？** ✅ 全部完成，3 個 commit 已提交
3. **下一步？** 測試不同手機裝置上的全螢幕場地圖顯示效果
4. **阻礙？** 無
5. **檔案？** `FRC/components/FieldCanvas.tsx`, `FRC/components/TabViews.tsx`

---
*Last updated: 2026-02-09*

---

## Session: 2026-02-10

### Overview
延續上一 session 的全螢幕場地圖修復，本次完成 PWA orientation 解鎖、碼錶永遠顯示、移除 Auto/Teleop 計時器及相關設定。

---

### Phase 32 (續): 全螢幕場地圖收尾
- **Status:** ✅ complete
- **Completed:** 2026-02-10

#### Task 32.4: 碼錶永遠顯示
- `onClimbTimeChange` 之前只在 `autoClimbStatus !== None` 時傳入
- 改為永遠傳入 `climbTime` 和 `onClimbTimeChange`，碼錶始終可用

#### Task 32.5: PWA orientation 解鎖
- `manifest.json` 的 `"orientation": "portrait"` 改為 `"any"`
- 修復 Android PWA 加到主畫面後無法轉橫向的問題

---

### Phase 33: 移除 Auto/Teleop 計時器
- **Status:** ✅ complete
- **Completed:** 2026-02-10

#### Task 33.1: 刪除 PhaseTimeIndicator 組件
- 刪除 `components/ui/PhaseTimeIndicator.tsx` 組件
- 移除 AutonTab 和 TeleopTab 中的 `<PhaseTimeIndicator>` 呼叫

#### Task 33.2: 移除 Settings 計時器開關
- 移除 Settings 中的 Match Timer Toggle
- 清理所有 `showMatchTimer` 相關 state、prop、localStorage (`match_timer_enabled`)

---

### 完成項目
- [x] 碼錶永遠顯示，不受 autoClimbStatus 限制
- [x] PWA orientation 改為 any，允許橫向旋轉
- [x] 刪除 `PhaseTimeIndicator.tsx` 組件
- [x] 移除 AutonTab/TeleopTab 的 `<PhaseTimeIndicator>` 呼叫
- [x] 移除 Settings 計時器開關 (showMatchTimer state + localStorage)

### 修改檔案
- `FRC/components/FieldCanvas.tsx` - Portal 渲染 + window 尺寸計算（延續上一 session）
- `FRC/components/TabViews.tsx` - 移除計時器、碼錶永遠傳入
- `FRC/App.tsx` - 移除 showMatchTimer state/settings/props
- `FRC/public/manifest.json` - orientation: any
- `FRC/components/ui/PhaseTimeIndicator.tsx` - **已刪除**

### Git Commits
- `3d57274` - fix: 修復全螢幕場地圖尺寸計算 - 改用 window 直接計算
- `708f48f` - fix: 用 React Portal 渲染全螢幕 overlay 到 document.body
- `ef887d1` - fix: 全螢幕碼錶永遠顯示，不受 autoClimbStatus 限制
- `86950f4` - fix: PWA orientation 改為 any，允許橫向旋轉
- `10b0ca0` - feat: 移除 Auto/Teleop 計時器及相關設定

---

## 5-Question Reboot Check

1. **做什麼？** 全螢幕場地圖收尾 + PWA orientation 解鎖 + 移除計時器功能
2. **進度？** ✅ 全部完成，5 個 commit 已提交
3. **下一步？** 測試 Android PWA 橫向旋轉、驗證移除計時器後無殘留 UI
4. **阻礙？** 無
5. **檔案？** `FRC/components/TabViews.tsx`, `FRC/App.tsx`, `FRC/public/manifest.json`

---
*Last updated: 2026-02-10*

---

## Session: 2026-02-10 (Part 2)

### Overview
更新 2026 FRC 官方賽事資料 -- 從 TBA 取得 221 個賽事、Magnolia Regional 45 支隊伍

---

### Phase 34: 2026 FRC 官方賽事資料更新
- **Status:** ✅ complete
- **Completed:** 2026-02-10

#### Task 34.1: 取得 2026 完整賽事列表
- 從 The Blue Alliance 網站取得 2026 年完整 221 個官方 FRC 賽事
- 更新 `data/events2026.ts`：7 個 placeholder 事件 → 221 個官方賽事
- 按 Week 分組：Preseason + Week 1-7 + Championship

#### Task 34.2: 更新 Magnolia Regional 賽程資料
- 假的 Malaysia Regional → 真實的 Magnolia Regional (2026mslr)
- 加入 45 支已註冊隊伍（含 Team 6998 Unipards）
- 新增 `teams` 欄位和 `getEventTeams()` 函數
- 賽程尚未公布（比賽 3/18 開始）

#### Task 34.3: TBA API Key 更新
- 更新 `C:\Users\USER\.claude.json` 中的 TBA API Key

#### Task 34.4: Build 驗證
- `npm run build` 通過
- JS bundle: 284 KB

---

### 重要發現
- 2026 年沒有 Malaysia Regional 也沒有 Taiwan Regional
- `2026mslr` 代碼現在是 Magnolia Regional（美國密西西比州 Laurel）
- Team 6998 今年報名了 Magnolia Regional，3/18-21（Week 3）
- Shanghai Regional (2026cnsh) 是亞洲唯一的賽事之一
- Championship 在 Houston，4/29-5/2，有 8 個 Division

### 完成項目
- [x] 從 TBA 取得 2026 年 221 個官方 FRC 賽事
- [x] 更新 `data/events2026.ts`（7 → 221 個賽事，按 Week 分組）
- [x] 更新 `data/eventSchedule.ts`（Magnolia Regional + 45 支隊伍 + getEventTeams()）
- [x] TBA API Key 更新
- [x] Build 驗證通過（JS bundle: 284 KB）
- [x] Git commit & push

### 修改檔案
- `FRC/data/events2026.ts` - 221 個官方賽事（來源：TBA）
- `FRC/data/eventSchedule.ts` - Magnolia Regional 45 支隊伍 + getEventTeams()
- `FRC/PROGRESS.md` - session 記錄
- `FRC/CLAUDE.md` - 文件更新
- `FRC/FINDINGS.md` - 文件更新
- `C:\Users\USER\.claude.json` - TBA API Key 更新

### Git Commits
- `fe4fb59` - feat: update 2026 event data from TBA (221 events, Magnolia Regional teams)

---

## 5-Question Reboot Check

1. **做什麼？** 更新 2026 FRC 官方賽事資料（221 個賽事 + Magnolia Regional 45 支隊伍）
2. **進度？** ✅ 全部完成，已 commit & push
3. **下一步？** 等賽程公布後更新 `eventSchedule.ts` 的 matches 資料（Magnolia Regional 3/18 開始）
4. **阻礙？** 賽程尚未公布（比賽 3/18 才開始）
5. **檔案？** `FRC/data/events2026.ts`, `FRC/data/eventSchedule.ts`

---
*Last updated: 2026-02-10*

---

## Session: 2026-03-05

### Overview
Climb Position 預設值修正 — climb status 為 None 時 position 改為 None

---

### Phase 35: Climb Position 預設值修正
- **Status:** ✅ complete
- **Completed:** 2026-03-05

#### Task 35.1: ClimbPosition 類型加入 None
- ClimbPosition 類型新增 'None' 選項
- INITIAL_DATA 的 autoClimbPosition 和 teleClimbPosition 預設從 'Center' 改為 'None'

#### Task 35.2: Climb Status None 重置邏輯
- Auto climb status 選 None 時，position 重置為 'None'（原 'Center'）
- Teleop climb status 選 None 時，position 重置為 'None'（原 'Center'）

---

### 完成項目
- [x] ClimbPosition 類型加入 'None'
- [x] INITIAL_DATA autoClimbPosition 預設改為 'None'
- [x] INITIAL_DATA teleClimbPosition 預設改為 'None'
- [x] Auto climb None 重置 position 為 'None'
- [x] Teleop climb None 重置 position 為 'None'

### 修改檔案
- `types.ts` - ClimbPosition 加入 'None'，INITIAL_DATA 預設值更新
- `components/TabViews.tsx` - climb status None 重置邏輯更新

### Git Commits
- `d98922d` - fix: climb position defaults to None when climb status is None

---

## Session: 2026-04-15

### Overview
FieldCanvas 自動路徑畫布根據裝置方向自動切換全螢幕 — 橫向進入 fullscreen，直向退出回到分頁視圖

---

### Phase 36: FieldCanvas 方向自動切換全螢幕
- **Status:** ✅ complete
- **Completed:** 2026-04-15

#### Task 36.1: 方向偵測 useEffect
- 在 `components/FieldCanvas.tsx` line 112-127 新增 useEffect
- 使用 `window.matchMedia('(orientation: landscape)')` 偵測裝置方向
- 橫向 → `setCanvasSize(calcFullscreenSize())` + `setIsFullscreen(true)`（復用既有 fullscreen 機制）
- 直向 → `setIsFullscreen(false)`
- 掛載時立即執行一次 `applyOrientation()` 確認初始狀態
- 使用 `mql.addEventListener('change', ...)` 監聽方向變更
- 回傳 cleanup function 正確移除 listener 避免記憶體洩漏

#### Task 36.2: 技術決策
- 選用 `matchMedia` 而非 `window.innerWidth > innerHeight` — 語意更精準，且有專屬的 change event
- 保留手動 `handleEnterFullscreen` 按鈕 — 使用者仍可在直向模式主動進入 fullscreen
- Exit 按鈕行為未修改 — 在橫向時點 exit 會被下一次 orientation change 覆蓋回來，這是預期行為

---

### 完成項目
- [x] 新增 orientation 偵測 useEffect
- [x] 橫向自動進入 fullscreen
- [x] 直向自動退出 fullscreen
- [x] 掛載時立即檢查當前方向
- [x] Cleanup listener 避免記憶體洩漏
- [x] `npm run build` 通過（2.59s，無 TypeScript 錯誤）

### 修改檔案
- `components/FieldCanvas.tsx` - 新增方向自動切換 fullscreen 的 useEffect（+17 行）

### Git Commits
- `fb6b2d6` - feat: auto fullscreen FieldCanvas on landscape orientation
- 已 push 到 origin/main（`d98922d..fb6b2d6`）
- 1 file changed, 17 insertions(+)
- 註：其他未 commit 的 md 檔案（CLAUDE.md/FINDINGS.md/PROGRESS.md）本次未處理

---

## 5-Question Reboot Check

1. **做什麼？** FieldCanvas 方向自動切換全螢幕
2. **進度？** ✅ 完成並 push（commit fb6b2d6）
3. **下一步？** 實機測試確認橫向/直向切換行為；無其他明確後續
4. **阻礙？** 無
5. **檔案？** `components/FieldCanvas.tsx`

---

## Session: 2026-04-15 (Part 2)

### Overview
修改預設賽事代碼 — 從 `2026MSLR`（Magnolia Regional）改為 `2026cmptx`（FIRST Championship, Houston）

---

### Phase 37: 預設 eventCode 更新為 Championship
- **Status:** ✅ complete
- **Completed:** 2026-04-15

#### Task 37.1: 確認目標賽事代碼
- 在 `data/events2026.ts:241` 找到 `2026cmptx`
- FIRST Championship, Houston, 2026-04-29 ~ 2026-05-02
- 屬於 Championship 分類

#### Task 37.2: 修改 INITIAL_DATA.eventCode
- `types.ts:105` 預設值從 `'2026MSLR'` 改為 `'2026cmptx'`
- 單行變更（+1 −1）

#### Task 37.3: Build 驗證
- `npm run build` 通過（5.29s）
- JS bundle: 284.67 kB
- 無 TypeScript 錯誤

---

### 完成項目
- [x] 在 events2026.ts 確認 Championship 賽事代碼
- [x] 更新 `types.ts:105` INITIAL_DATA.eventCode 預設值
- [x] `npm run build` 通過（5.29s，bundle 284.67 kB）
- [x] Git commit & push 到 origin/main

### 修改檔案
- `FRC/types.ts` line 105 - eventCode 預設 `'2026MSLR'` → `'2026cmptx'`

### Git Commits
- `2f58849` - fix: default eventCode to 2026cmptx (FIRST Championship)
- 已 push 到 origin/main（`fb6b2d6..2f58849`）
- 1 file changed, 1 insertion(+), 1 deletion(-)
- 註：僅 commit `types.ts`；CLAUDE.md/FINDINGS.md/PROGRESS.md 的既有未 commit 變更保持未動（延續上次 session 作法）

---

## 5-Question Reboot Check

1. **做什麼？** 將預設 eventCode 從 2026MSLR 改為 2026cmptx (FIRST Championship)
2. **進度？** ✅ 完成並 push（commit 2f58849）
3. **下一步？** 無明確後續；視需要可 commit 累積的 md 檔案變更
4. **阻礙？** 無
5. **檔案？** `FRC/types.ts:105`, `FRC/data/events2026.ts:241`

---

## Session: 2026-04-20 (Part 3)

### Overview
PostMatch Comments 改為結構化勾選清單 — 依 `scouting 最後一頁.md` 內容加入機器異常、機器表現、劇烈撞擊、動作評分四個區段，序列化回既有 `comments` 欄位（TSV schema 不變、code.gs 不需更動）

---

### Phase 38: PostMatch 勾選清單改造
- **Status:** ✅ complete
- **Completed:** 2026-04-20

#### Task 38.1: Brainstorming 與 Spec
- 確認三個關鍵設計決策：
  - 儲存方式 A — 序列化字串寫回既有 `comments`（避免動 TSV schema / code.gs）
  - 自由文字 C — 不保留整體 free-form，只保留「隊友/對手隊號」單一 input
  - i18n A — 新增雙語 key（英文 + 繁中）
- 撰寫 spec：`FRC/docs/superpowers/specs/2026-04-20-postmatch-checklist-design.md`

#### Task 38.2: 型別與預設值（types.ts）
- 新增 `ChecklistRating` type（`'' | 'good' | 'ok' | 'bad'`）
- 新增 `PostMatchChecklist` interface（issues/flags/collision/collisionTeams/ratings）
- `ScoutingData.postMatchChecklist?` 設為 optional — 舊 localStorage 資料可 fallback
- `INITIAL_DATA.postMatchChecklist` 預設空集合

#### Task 38.3: 序列化工具（utils/checklistSerializer.ts）
- 新增常數：`ISSUE_KEYS`（11）、`FLAG_KEYS`（6）、`RATING_ROW_KEYS`（5）、`RATING_VALUES`
- `serializeChecklist()` — 把 checklist 轉成多行 `[Section] value` 字串，寫回 `comments`
- `toggleInArray()` — chip 切換 helper

#### Task 38.4: i18n（LanguageContext.tsx）
- 新增 ~30 個雙語 key：
  - Section header：issuesHeader / performanceHeader / collisionSubHeader / ratingsSubHeader
  - Issue chips：11 個 `issue_*`
  - Performance flags：6 個 `flag_*`
  - Collision：4 個 `collision_*`（toggle label、field/robot、team input placeholder）
  - Rating：5 個評分列 label + 3 個評分值（good / ok / bad）

#### Task 38.5: UI 重寫（TabViews.tsx → PostMatchTab）
- 移除舊有 comments textarea，改為結構化 UI：
  1. 機器異常（Robot Issues）— 11 個紅色 chip toggle
  2. 機器表現（Performance）— 6 個琥珀 chip toggle
  3. 劇烈撞擊（Hard collision）— toggle + field/robot chips + 條件顯示的隊號 text input
  4. 動作評分（Action Ratings）— 5 行 4 段式 segmented button（—/很好/還不錯/差）
- 所有變更透過 `update({ postMatchChecklist, comments: serializeChecklist(...) })` 同步回 state

#### Task 38.6: 驗證
- `npm run build` 通過（1.77s，bundle 291.38 kB，+6.5 kB）
- 瀏覽器自動化實測：chip toggle、collision 條件顯示、隊號 input、localStorage 序列化
- 確認 TSV schema 未變 → code.gs 不需動

---

### 完成項目
- [x] Brainstorming 三個設計決策（儲存 A / 自由文字 C / i18n A）
- [x] 撰寫 spec 文件
- [x] 新增 `PostMatchChecklist` type 與 `INITIAL_DATA` 預設值
- [x] 新增 `utils/checklistSerializer.ts`（常數 + 序列化 + toggle helper）
- [x] 新增 ~30 個雙語 i18n key
- [x] 重寫 `PostMatchTab` 的 comments 區塊
- [x] `npm run build` 通過
- [x] 瀏覽器實測通過
- [x] 5 個 feature commit 全部 push 到 origin/main

### 修改檔案
- `FRC/types.ts` — 新增 `ChecklistRating`、`PostMatchChecklist`、`ScoutingData.postMatchChecklist?`、`INITIAL_DATA.postMatchChecklist`
- `FRC/utils/checklistSerializer.ts`（新檔）— 常數表 + `serializeChecklist()` + `toggleInArray()`
- `FRC/contexts/LanguageContext.tsx` — 新增 ~30 個雙語 key
- `FRC/components/TabViews.tsx` — 重寫 `PostMatchTab` comments 區塊為結構化 checklist UI
- `FRC/docs/superpowers/specs/2026-04-20-postmatch-checklist-design.md`（新檔）
- `FRC/docs/superpowers/plans/2026-04-20-postmatch-checklist.md`（新檔，未 commit）

### Git Commits
- 5 個 commit 已 push 到 origin/main (`2f58849..5a771f0`)
- `94bec60` - docs: add PostMatch checklist design spec
- `7ff22bc` - feat(types): add PostMatchChecklist interface and default
- `f44e102` - feat(utils): add PostMatchChecklist serializer and key tables
- `99dc5dc` - feat(i18n): add PostMatch checklist translation keys (en + zh)
- `5a771f0` - feat(postmatch): replace comments textarea with structured checklist UI
- 註：本次延續慣例未 commit 累積的 md 檔（CLAUDE.md / FINDINGS.md / PROGRESS.md）與 plan 檔

### 序列化格式範例
```
[Robot Issues] Low voltage, Stuck on bump
[Performance] Yellow card
[Hard collision] Robot(1234, 5678)
[Defense] Poor
```

### 向下相容
- `postMatchChecklist` 為 optional — 舊 localStorage 記錄以空預設值 fallback
- `HistoryEditForm.tsx` 暫維持 `comments` textarea 編輯（YAGNI — 歷史編輯頁不重建 checklist UI）

---

## 5-Question Reboot Check

1. **做什麼？** PostMatch Comments 改為結構化勾選清單（issues / performance / collision / ratings）
2. **進度？** ✅ 完成並 push（5 個 feature commit）
3. **下一步？** 實機測試手機瀏覽器 + iOS App；視需要統一 commit 累積的 md 檔
4. **阻礙？** 無
5. **檔案？** `FRC/components/TabViews.tsx` (PostMatchTab), `FRC/utils/checklistSerializer.ts`, `FRC/types.ts`, `FRC/contexts/LanguageContext.tsx`

---

## Session: 2026-04-21 (PostMatch UI 清理：可摺疊區段 + 自由文字 + 三欄拆分)

### Overview
延續 2026-04-20 Phase 38 的 PostMatch 改造：(1) 移除 UI 頂部三個 Toggle（robotDied / almostTipped / ridingOnBall），(2) 機器異常與機器表現改為點擊展開的可摺疊區段並顯示數量 badge，(3) 恢復 free-text comments textarea，(4) 最後把單一 `comments` TSV 欄位拆成三個欄位：`robotIssues` / `performance` / `comments`（schema 21 → 23 欄，為 breaking change），(5) 預設 eventCode 改為 Championship。

---

### Phase 39: PostMatch UI 清理 + 自由文字恢復
- **Status:** ✅ complete
- **Completed:** 2026-04-21

#### Task 39.1: 移除頂部三個 Toggle
- `components/TabViews.tsx` 移除 `robotDied` / `almostTipped` / `ridingOnBall` 三個 Toggle UI
- `types.ts` / `constants.ts` / `TSV_SCHEMA_MATCH` 的布林欄位保留（預設 `false`）— 不動資料 schema 保向下相容
- 既有 localStorage 記錄仍能正常匯出 TSV，欄位位置不變

#### Task 39.2: 可摺疊區段（機器異常 / 機器表現）
- 兩個 Section 改為「按標題展開/收合」pattern，每個 section 顯示啟用項目數量 badge
- 減少 PostMatch 頁面視覺雜訊（11 + 6 個 chip 預設全部收起）

#### Task 39.3: 恢復 free-text comments
- PostMatchTab 新增 `<textarea>`，寫入 `postMatchChecklist.extraComments`
- `types.ts` `PostMatchChecklist` 新增 optional `extraComments?: string`
- `utils/checklistSerializer.ts` `serializeChecklist()` 尾端附加 extraComments

#### Task 39.4: i18n 標籤修正
- `issue_crashed` 英文由 "Crashed" 改為 "Robot Died/Disabled"（更精準對應原 robotDied 布林涵義）

### Git Commit: `7a67a01` — `feat(postmatch): collapsible sections + restore free-text comments`

---

### Phase 40: 拆分 PostMatch Comments 為 3 欄（Breaking Schema Change）
- **Status:** ✅ complete
- **Completed:** 2026-04-21

#### 動機
Phase 38 時為了不動後端 schema，把所有 checklist 結果序列化到單一 `comments` 欄位。實際使用後發現 Google Sheets 分析時難以拆分（混合內容），改為三欄位更利於後續 SQL/OPR 統計。

#### Task 40.1: Schema 擴充（21 → 23 欄）
- `constants.ts` `TSV_SCHEMA_MATCH` 長度 21 → 23
- 新增欄位：`robotIssues`（機器異常條列）、`performance`（flags + collision + ratings）、`comments`（僅 free-text extraComments）
- `types.ts` `ScoutingData` 與 `INITIAL_DATA` 新增 `robotIssues: string` + `performance: string`

#### Task 40.2: Serializer 三分（utils/checklistSerializer.ts）
- 移除舊 `serializeChecklist()`
- 新增 `serializeIssues()` / `serializePerformance()` / `serializeComments()` 三函數
- UI 每次 `updateChecklist` 同時覆寫三個欄位（單一 `update()` 呼叫避免脫節）

#### Task 40.3: 上傳端更新（services/googleSheets.ts）
- 原 `formatComments` 替換為通用 `formatTextField`
- TSV 產生與 Google Apps Script payload 皆同步處理三欄

#### Task 40.4: 遷移需求（重要！）
- 既有 Google Sheets 仍是 21 欄標頭。部署新 `Code.gs` 後必須手動 GET `?action=fixHeaders` 一次，讓工作表自動更新為 23 欄標頭
- 舊 localStorage 記錄無 `robotIssues` / `performance` / `extraComments`，載入時 fallback 空字串，匯出仍顯示 'None'

### Git Commit: `b12fe22` — `feat(schema): split postmatch comments into 3 columns`

---

### Phase 41: 預設 eventCode 切到 Championship
- **Status:** ✅ complete
- **Completed:** 2026-04-21

- `types.ts` `INITIAL_DATA.eventCode` 由 `'2026cmptx'` 改為 `'2026CMPTX'`（大寫統一）
- `EventCodeSelect` 原本就是 case-insensitive 比對，events2026.ts 清單不需動

### Git Commit: `ade753c` — `chore(config): default eventCode to 2026CMPTX (Championship)`

---

### 完成項目
- [x] 移除 PostMatch 頂部 3 個 Toggle（UI only，資料欄位保留）
- [x] 機器異常 / 機器表現 改為可摺疊區段 + 數量 badge
- [x] 恢復 free-text comments textarea → `postMatchChecklist.extraComments`
- [x] `issue_crashed` EN label → "Robot Died/Disabled"
- [x] TSV_SCHEMA_MATCH 21 → 23 欄（新增 `robotIssues` + `performance`）
- [x] `serializeChecklist` 拆為 `serializeIssues` / `serializePerformance` / `serializeComments`
- [x] `googleSheets.ts` 改用通用 `formatTextField` 處理 3 個文字欄
- [x] `INITIAL_DATA.eventCode` 改為 `'2026CMPTX'`
- [x] 3 個 commit 已 push 到 origin/main

### 修改檔案
- `FRC/components/TabViews.tsx` — PostMatchTab 可摺疊區段 + free-text textarea + 移除 3 個 Toggle；`updateChecklist` 同時覆寫 robotIssues/performance/comments
- `FRC/contexts/LanguageContext.tsx` — `issue_crashed` 英文改寫 + 新增 extraComments/section 相關 key
- `FRC/types.ts` — `PostMatchChecklist.extraComments?`、`ScoutingData` 新增 `robotIssues` + `performance`、`INITIAL_DATA.eventCode` 大寫
- `FRC/utils/checklistSerializer.ts` — 三個 serialize 函數替換 `serializeChecklist`
- `FRC/constants.ts` — TSV_SCHEMA_MATCH 21 → 23
- `FRC/services/googleSheets.ts` — `formatComments` → `formatTextField` 通用化、TSV 與 payload 三欄同步

### Git Commits
- `7a67a01` - feat(postmatch): collapsible sections + restore free-text comments
- `b12fe22` - feat(schema): split postmatch comments into 3 columns
- `ade753c` - chore(config): default eventCode to 2026CMPTX (Championship)

### 向下相容與遷移
- 舊 MatchRecord（localStorage）無新欄位 → 載入時 fallback 空字串 / undefined
- `robotDied` / `almostTipped` / `ridingOnBall` 欄位 **保留在 TSV_SCHEMA_MATCH**，只是 UI 沒有編輯入口（永遠為 false）
- **部署後必須手動呼叫 `?action=fixHeaders`** 讓既有 Google Sheets 升級到 23 欄標頭（見 scanner repo Code.gs）

---

## 5-Question Reboot Check

1. **做什麼？** PostMatch UI 清理（移除 3 Toggle、摺疊區段、恢復自由文字）+ TSV schema 拆 comments 為 3 欄（21 → 23）+ 預設 eventCode 切 Championship
2. **進度？** ✅ 3 個 commit 全部 push；配合的 scanner repo 也已同步（commit `686c1ff`）
3. **下一步？** (1) 部署新 Code.gs 到 Google Sheets 並呼叫 `?action=fixHeaders` 升級標頭 (2) 全隊 scouter 在 Scanner Settings 確認 API URL (3) 實機測試 PostMatch 可摺疊 UI + 三欄匯出
4. **阻礙？** 無程式碼阻礙；遷移要求：舊試算表必須手動觸發 fixHeaders 一次
5. **檔案？** `FRC/components/TabViews.tsx`、`FRC/utils/checklistSerializer.ts`、`FRC/constants.ts`、`FRC/types.ts`、`FRC/services/googleSheets.ts`、`FRC/contexts/LanguageContext.tsx`

---

## Session: 2026-04-21 (第二段) — PostMatch 扁平化欄位設計

### Overview
延續 Phase 40 的 schema 擴充（21 → 23 欄），使用者進一步要求把 `robotIssues` 與 `performance` 兩個彙總文字欄位**完全拆成多個獨立欄位**，讓 Google Sheets / OPR 分析時每個 issue / flag / collision 都有獨立 0/1 欄位，rating 則以文字 (good/ok/bad/空) 呈現。

**本段 session 僅完成設計決策 + spec 文件撰寫，尚未實作。**

---

### Phase 42: PostMatch 扁平化欄位設計（Design Only）
- **Status:** ⏸️ design complete / implementation pending
- **Started:** 2026-04-21

#### 流程
使用 `superpowers:brainstorming` skill 完成三個設計決策問題：

1. **Ratings 格式** → **C**：保留 5 欄文字（good/ok/bad/空），**不拆**成 0/1
   - 理由：rating 是有序 enum，文字比 one-hot 更緊湊且語意完整
2. **Collision 處理** → **B**：3 欄 0/1（`hasCollision` / `collisionField` / `collisionRobot`）+ 1 欄文字 `collisionTeamNumbers`
   - 理由：布林旗標 + 隊號 text 組合，比一欄寫「Robot(1234,5678)」更利於 pivot 統計
3. **舊廢欄位** → **A**：一次清掉 `robotDied` / `almostTipped` / `ridingOnBall`
   - 理由：Phase 39 UI Toggle 已移除後這三欄永遠為 false，是 dead data；一刀切後 schema 更乾淨

#### Schema 變更摘要（待實作）
- **TSV_SCHEMA_MATCH：23 欄 → 44 欄**
- 前 17 欄（PreMatch / Auto / Teleop / Penalty / Climb）**完全不變**
- 後段 27 欄拆為：
  - 11 × issue (0/1)
  - 6 × flag (0/1)
  - 3 × collision boolean (0/1)
  - 1 × collision text（隊號列表）
  - 5 × rating text（good/ok/bad/空）
  - 1 × comments（沿用，綁 `extraComments` free-text）

#### 新增欄位命名
- Issues: `issueNoShow`, `issueCrashed`, `issueEStop`, `issueAStop`, `issueLowVoltage`, `issueIntakeStuck`, `issueShooterOff`, `issueStuckBump`, `issueHitTrench`, `issuePartFell`, `issueMovement`
- Flags: `flagYellowCard`, `flagRedCard`, `flagBelowExpected`, `flagTipped`, `flagRidingFuel`, `flagStuckBall`
- Collision: `hasCollision`, `collisionField`, `collisionRobot`, `collisionTeamNumbers`
- Ratings: `ratingPushTrench`, `ratingPushBump`, `ratingShoot`, `ratingHuman`, `ratingDefense`
- Free-text: `comments`

### 完成項目
- [x] 用 `superpowers:brainstorming` skill 完成 3 個設計決策
- [x] Spec 文件寫入 `FRC/docs/superpowers/specs/2026-04-21-postmatch-flat-fields-design.md`
- [x] Commit `33c87f5` — `docs: add PostMatch flat-fields design spec`
- [ ] ⏸️ **未 push** — 僅 local commit
- [ ] ⏸️ writing-plans skill 尚未 invoke（下次 session 第一步）
- [ ] ⏸️ 實作尚未開始

### 將要修改的檔案（尚未動）
- `FRC/constants.ts` — `TSV_SCHEMA_MATCH` 23 → 44 欄
- `FRC/types.ts` — `ScoutingData` 移除 5 個舊 key、新增 26 個新 key；`PostMatchChecklist` 型別**不動**
- `FRC/utils/checklistSerializer.ts` — 刪 3 個舊 serializer（serializeIssues / serializePerformance / serializeComments）、新增 `checklistToFlatFields()` 產生扁平欄位物件
- `FRC/components/TabViews.tsx` — `PostMatchTab.updateChecklist` 同步扁平欄位
- `FRC/services/googleSheets.ts` — `formatTextField` 擴充支援 boolean → '0'/'1'
- scanner repo `Code.gs` — 標頭改 44 欄；部署後手動 `?action=fixHeaders`

### 設計決策要點（為何這樣選）
- Rating 保留文字：三值 enum (good/ok/bad/空) 拆 5×3=15 欄太稀疏，文字欄位直接可 `COUNTIF` 統計
- Collision 用 bool + text 組合：`hasCollision` 可當主 filter，隊號再查 detail，分析彈性優於單欄 JSON
- 舊廢欄位一刀切：Phase 39 確認 UI 永遠寫不到這三個布林，留著只會讓 schema 每次擴充都多 3 欄雜訊

---

## 5-Question Reboot Check（給明日接續用）

1. **做什麼？** 接續 Phase 42：依 spec (`FRC/docs/superpowers/specs/2026-04-21-postmatch-flat-fields-design.md`) 實作 PostMatch 扁平化 44 欄 schema
2. **進度？** 設計 ✅ 完成 + spec commit（`33c87f5`）；實作 ⏸️ 未開始
3. **下一步？**
   - (a) **先 push** `33c87f5` 到 origin/main（本段未 push）
   - (b) **Invoke `superpowers:writing-plans` skill** 讀 spec 產生正式實作計畫（分階段 checkpoint）
   - (c) 依計畫依序改 `constants.ts` → `types.ts` → `checklistSerializer.ts` → `TabViews.tsx` → `googleSheets.ts` → scanner `Code.gs`
   - (d) 部署後執行 `?action=fixHeaders` 升級既有 Sheets 到 44 欄標頭
4. **阻礙？** 無；但注意遷移順序 — 要先改完 Scouting PASS 前端（含新版 TSV 產生），再改 scanner / Code.gs，最後才 fixHeaders，避免 scouter 上傳到舊 44 欄 Sheets 出錯
5. **檔案？**
   - Spec: `FRC/docs/superpowers/specs/2026-04-21-postmatch-flat-fields-design.md`
   - 待改: `FRC/constants.ts`、`FRC/types.ts`、`FRC/utils/checklistSerializer.ts`、`FRC/components/TabViews.tsx`、`FRC/services/googleSheets.ts`、scanner repo `Code.gs`

---

## Session: 2026-04-21 (第三段) — PostMatch flat-fields implementation + fuel ratings + scanner sync

### Overview
接續 Phase 42 的設計 spec，實作完整 PostMatch 扁平化欄位 pipeline（23 → 44 欄），再依使用者要求擴充 +3 fuel 動作評分（44 → 47 欄），最後同步 scanner repo 前後端並修復一個自己踩的漏同步 bug。

本段 session 完成跨兩個 repo 共 6 個 commit 推送到 origin/main。

---

### Phase 43: PostMatch 扁平化欄位實作（23 → 44 欄）
- **Status:** ✅ complete
- **Completed:** 2026-04-21

#### Tasks
- [x] Push Phase 42 未 push 的 `33c87f5` spec 文件 commit 到 origin/main
- [x] Invoke `superpowers:writing-plans` skill → 產出正式實作計畫 `FRC/docs/superpowers/plans/2026-04-21-postmatch-flat-fields.md`（併入主 commit）
- [x] `constants.ts`：`TSV_SCHEMA_MATCH` 23 → 44；刪 5 個舊欄位（`robotDied` / `almostTipped` / `ridingOnBall` / `robotIssues` / `performance`）；新增 26 個扁平欄位（前 17 欄完全不動）
- [x] `types.ts`：`ScoutingData` 同步增刪；`INITIAL_DATA` 同步；`PostMatchChecklist` 型別**不動**
- [x] `utils/checklistSerializer.ts`：刪 `serializeIssues / serializePerformance / serializeComments`；改為單一 `checklistToFlatFields(c: PostMatchChecklist): Partial<ScoutingData>` 產出 26 個 flat 欄位；`ISSUE_FIELD_MAP / FLAG_FIELD_MAP / RATING_FIELD_MAP` 三個對應表；**collision clamp**（`hasCollision && collisionField` 等）避免關閉 collision 時子欄位洩漏
- [x] `components/TabViews.tsx`：`PostMatchTab.updateChecklist` 改為 `update({ postMatchChecklist: next, ...checklistToFlatFields(next) })`，移除舊 serialize 三呼叫
- [x] `components/HistoryEditForm.tsx`：刪 3 個舊 checkbox（robotDied / almostTipped / ridingOnBall），否則 TS 編不過
- [x] `contexts/LanguageContext.tsx`：刪 6 個 orphan i18n key（EN + ZH × robotDied/almostTipped/ridingOnBall）
- [x] `services/googleSheets.ts`：簡化 `formatTextField`（不再返回 `'None'`）；新增 `PRESERVE_EMPTY_KEYS` Set 讓 `comments / collisionTeamNumbers / rating*` 空值輸出 `''` 而非 `'None'`
- [x] `npm run build` 通過

#### 修改檔案
- `FRC/constants.ts` — TSV_SCHEMA_MATCH 23 → 44
- `FRC/types.ts` — `ScoutingData` / `INITIAL_DATA` 同步
- `FRC/utils/checklistSerializer.ts` — 架構改寫（`checklistToFlatFields` 單一入口）
- `FRC/components/TabViews.tsx` — PostMatchTab updateChecklist 改寫
- `FRC/components/HistoryEditForm.tsx` — 刪 3 個 checkbox
- `FRC/contexts/LanguageContext.tsx` — 刪 6 個 orphan key
- `FRC/services/googleSheets.ts` — `PRESERVE_EMPTY_KEYS` 新增

#### Git Commits
- `33c87f5` — docs: add PostMatch flat-fields design spec（上段 session 的本地 commit，此次才 push）
- `8e84556` — feat(schema): flatten postmatch to 44 columns（7 檔 + plan 文件）

---

### Phase 44: +3 fuel 動作評分（44 → 47 欄）
- **Status:** ✅ complete
- **Completed:** 2026-04-21

#### 背景
使用者要求新增 3 個 rating 細化 fuel 處理流程（吸 → 輸送 → 射擊）。同時澄清既有 `ratingShoot` 語意是「射球回 Alliance Zone」而非「射擊 fuel」（i18n label 本已正確，欄位名保留不改）。

#### 使用者決策
Option A — 保留舊 `ratingShoot`，新增 3 個 `ratingIntakeFuel / ratingTransportFuel / ratingShootFuel`，插在 `ratingDefense` 之後、`comments` 之前以維持 rating 群組連續。

#### Tasks
- [x] `constants.ts` — TSV_SCHEMA_MATCH 44 → 47，新增 3 rating key
- [x] `types.ts` — `ScoutingData` + `INITIAL_DATA` + `PostMatchChecklist.ratings` 各加 3 key
- [x] `utils/checklistSerializer.ts` — `RATING_ROW_KEYS` + `RATING_FIELD_MAP` 各加 3 entry
- [x] `contexts/LanguageContext.tsx` — EN + ZH 新增 `rating_intakeFuel / rating_transportFuel / rating_shootFuel`；`rating_shoot` label 維持原有「射球回 Alliance Zone」不動
- [x] `services/googleSheets.ts` — `PRESERVE_EMPTY_KEYS` 新增 3 個 rating key
- [x] UI **不用動** — PostMatchTab rating section 是 schema-driven（迭代 RATING_ROW_KEYS），新 key 自動渲染 3 列

#### 修改檔案
- `FRC/constants.ts`、`FRC/types.ts`、`FRC/utils/checklistSerializer.ts`、`FRC/contexts/LanguageContext.tsx`、`FRC/services/googleSheets.ts`

#### Git Commit
- `d37c5b0` — feat(rating): add 3 fuel-action ratings (44 -> 47 columns)

---

### Phase 45: Scanner sync + bug fix
- **Status:** ✅ complete
- **Completed:** 2026-04-21

#### Stage 3a — Code.gs 同步（scanner 後端）
- `31b8396` — Code.gs `TSV_SCHEMA_MATCH` 23 → 44（配合 Scouting PASS v1.6.0）
- `b5c8aba` — Code.gs 44 → 47（配合 Scouting PASS v1.7.0）
- scanner 版本字串 `1.5.0` → `1.6.0` → `1.7.0`

#### Stage 3b — Bug fix（scanner 前端漏同步）
**問題：** 使用者掃 47 欄 QR 報 `[detectQRType] Unknown field count: 47, expected: match=23`，路徑抓不到資料。

**根因：** Scanner repo **還有個前端**（`src/`）裡面也有獨立 TSV schema 鏡像，僅同步 Code.gs（後端）不夠。47 欄 QR 被 detectQRType 判為 `'unknown'` → `data.eventCode / matchNumber / teamNumber` 變 `field1/field2/...` → `getMatchKey()` 回傳空殼 key → Path QR 找不到配對的 Match → 「路徑抓不到資料」其實是 Match 解不出來的下游症狀。

**修復：**
- `src/constants/schema.ts` — `TSV_SCHEMA_MATCH` 替換為 47 欄；`FIELD_LABELS` 重建對應新 key
- `src/utils/decoder.ts` — `detectQRType` 簡化（match 47 欄不再與 pit-external-v2/legacy 23 欄衝突；23-col 直接歸 `'pit-external'`）
- `src/i18n/locales/en.ts` + `zh-TW.ts` — `fields` 字典重建（11 issue + 6 flag + 4 collision + 8 rating 共 29 個新 entries）

#### Git Commit
- `31d7844` — fix(schema): sync scanner frontend to v1.7.0 (47 columns)

---

### 關鍵學習（已存 memory）
改 TSV schema 時 scanner repo 有**三個地方**都要同步：
1. `google-apps-script/Code.gs` — backend 寫入 Sheets
2. `src/constants/schema.ts` — frontend 解 QR 的 schema 常數
3. `src/utils/decoder.ts` — `detectQRType` 的長度比對邏輯

加 i18n（`src/i18n/locales/*.ts`）雖不 block 功能但顯示會 fallback 到 raw key。

已存入 `C:\Users\USER\.claude\projects\D--FRC-frc-6998-scouting-pass\memory\`：兩個 memory 檔 + MEMORY.md index。

---

## 5-Question Reboot Check（給明日接續用）

1. **做什麼？** Phase 43-45：PostMatch 扁平化 44 欄實作 + 3 fuel ratings 擴充（44 → 47） + scanner repo 三處鏡像同步 + 前端漏同步 bug 修復
2. **進度？** ✅ 兩個 repo 共 6 commits 全數 push 到 origin/main（主 repo 3、scanner 3）；`npm run build` 通過
3. **下一步？** 使用者手動外部操作：
   - (a) 把 scanner 最新 `google-apps-script/Code.gs` 覆貼到 GAS project → 新版部署（版本 1.7.0）
   - (b) 對每個活躍 Sheet GET `<webAppUrl>?action=fixHeaders` 升級標頭（47 schema + autoPath/scanTime/uploadTime = 50 欄）
   - (c) 端對端 QR 掃描驗證（47 欄 Match QR 正確解碼 + Path QR 配對成功）
4. **阻礙？** 無程式碼阻礙；僅外部部署步驟待使用者執行
5. **檔案？**
   - 主 repo: `FRC/constants.ts`、`FRC/types.ts`、`FRC/utils/checklistSerializer.ts`、`FRC/components/TabViews.tsx`、`FRC/components/HistoryEditForm.tsx`、`FRC/contexts/LanguageContext.tsx`、`FRC/services/googleSheets.ts`
   - Plan 文件: `FRC/docs/superpowers/plans/2026-04-21-postmatch-flat-fields.md`
   - Scanner repo: `src/constants/schema.ts`、`src/utils/decoder.ts`、`src/i18n/locales/en.ts`、`src/i18n/locales/zh-TW.ts`、`google-apps-script/Code.gs`

---

## Session: 2026-04-26 — issueShooterStutter「射球不順」(v1.8.0, 47 → 48 欄)

### Overview
使用者要求新增第 12 個 PostMatch issue chip「射球不順」（射球射到一半短暫卡頓又恢復）。本次特別把上次（2026-04-21）踩過的坑列入 spec 對照表，全程精準防範。流程：用 `superpowers:brainstorming` 釐清語意 → 寫 spec → `superpowers:writing-plans` 寫 plan → EnterPlanMode 給使用者批准 → auto mode 連續執行 → 三方 schema 程式化驗證 → commit/push 兩 repo。

---

### Phase 46: issueShooterStutter 新增 (47 → 48 欄)
- **Status:** ✅ complete
- **Completed:** 2026-04-26

#### 命名決策
- TSV key: `issueShooterStutter`（key 與 label 對齊，避免重蹈 `issueShooterOff` key 名「Off」但 label「不準」的歷史包袱）
- 內部 key: `'shooterStutter'`
- ZH label: 射球不順
- EN label: Shooter stutters
- Schema 位置：緊接 `issueShooterOff` 後（idx 24，三方都一致）

#### 修改檔案 — 主 repo (4)
- `constants.ts`: `TSV_SCHEMA_MATCH` 47 → 48 + 檔頭 v1.8.0 註解
- `types.ts`: `ScoutingData` 加 `issueShooterStutter: boolean`、`INITIAL_DATA` 加 `false`、註解 (11) → (12)
- `utils/checklistSerializer.ts`: `ISSUE_KEYS` + `ISSUE_FIELD_MAP`
- `contexts/LanguageContext.tsx`: EN + ZH `issue_shooterStutter`

**未修改且驗證確認不需動：**
- `services/googleSheets.ts` — issue 欄位是 boolean → '0'/'1'，不在 PRESERVE_EMPTY_KEYS
- `components/TabViews.tsx` — UI schema-driven，自動渲染新 chip
- `PostMatchChecklist.issues` 型別是 `string[]` 寬鬆型別，不需動

#### 修改檔案 — Scanner repo (5) — 三處鏡像 + i18n 全到位
- `google-apps-script/Code.gs`: TSV_SCHEMA_MATCH + version `'1.7.0'` → `'1.8.0'` + 後續欄位編號註解全部 +1 保持一致
- `src/constants/schema.ts`: TSV_SCHEMA_MATCH + FIELD_LABELS（簡中「射球不顺」）
- `src/utils/decoder.ts`: 註解 47 → 48 (`detectQRType` 已用 `.length` 動態比對，邏輯自動跟上)
- `src/i18n/locales/en.ts`: `'Shooter stutters'`
- `src/i18n/locales/zh-TW.ts`: `'射球不順'`

#### 程式化驗證（防上次踩坑）
```
main length: 48 | gas length: 48 | scanner length: 48
main vs gas:     OK
main vs scanner: OK
issueShooterStutter idx in three: 24 24 24
```

#### 上次踩坑對照表（這次防範）
| 上次坑 | 這次處理 |
|--------|----------|
| Scanner 前端 `schema.ts` + `decoder.ts` 漏同步 | ✅ 兩個都改、加程式化驗證 |
| `detectQRType` 長度比對沒改 | ✅ 確認已動態 `.length`（過去事件改正後遺留），僅需更新註解 |
| i18n locales 漏更新 | ✅ scanner en.ts + zh-TW.ts 都加 |
| 部署後忘記 fixHeaders | ✅ 寫進 spec 部署順序 |
| PRESERVE_EMPTY_KEYS 漏 | ✅ 本次無 text 欄位變更，不適用 |

#### Git Commits（跨兩 repo）
- 主 repo: `c5da198` — feat(schema): add issueShooterStutter (47 -> 48 columns)（含 spec + plan 文件）
- Scanner repo: `d017015` — feat(schema): sync to v1.8.0 (47 -> 48 columns)
- 兩 commit 都已 push 到各自的 origin/main

#### 文件
- Spec: `FRC/docs/superpowers/specs/2026-04-26-issue-shooter-stutter-design.md`
- Plan: `FRC/docs/superpowers/plans/2026-04-26-issue-shooter-stutter.md`

---

### 觀察 / 學習
- **`detectQRType` 已自動動態化**（`length === TSV_SCHEMA_MATCH.length`）— 之前的 bug 修復已改成讀 `.length`，未來改 schema 不再需要硬編碼長度。但**註解** 仍要手動同步避免誤導讀者
- **欄位編號註解**：scanner `Code.gs` 中每行的欄位編號註解（// 17、// 18、...）是 readability 用，沒功能。這次插入新欄位後一併把後續編號 +1 是正確選擇（避免半套狀態），但要意識到這會讓 commit diff 看起來比實際變動大
- **PostMatchChecklist.issues 寬鬆型別**：用 `string[]` 而非 `IssueKey[]`，所以新增 issue key 完全不影響 type checking。這個 trade-off 是好的（schema-driven 自動兼容），代價是 typo 不會被 TS 抓到
- **使用者語氣 → auto mode 信號**：使用者「沒差你就弄上去就對了」+「這你決定就好了吧」連續兩次後 → 確認可以 auto mode；EnterPlanMode 一次性批准 + ExitPlanMode → 全程不打斷實作

---

## 5-Question Reboot Check（給明日接續用）

1. **做什麼？** Phase 46：新增 `issueShooterStutter`「射球不順」issue chip（v1.7.0 → v1.8.0，47 → 48 欄）
2. **進度？** ✅ 兩個 repo 共 2 commits 已 push 到 origin/main；主 repo + scanner repo 各自 `npm run build` 通過；三方 schema 程式化驗證 OK
3. **下一步？** 使用者外部手動操作：
   - (a) 把 scanner 最新 `google-apps-script/Code.gs` 覆貼到 GAS project → 部署新版（內部版本字串 1.8.0）
   - (b) 對每個活躍 Sheet GET `<webAppUrl>?action=fixHeaders` 升級到 48 欄標頭
   - (c) 端對端 QR 掃描驗證（48 欄 Match QR 解碼成功 + 射球不順 chip 勾選後 TSV 該欄輸出 1）
4. **阻礙？** 無程式碼阻礙；僅外部部署步驟待使用者執行（同 v1.7.0 上次部署流程）
5. **檔案？**
   - 主 repo: `constants.ts`、`types.ts`、`utils/checklistSerializer.ts`、`contexts/LanguageContext.tsx`、`CLAUDE.md`、`PROGRESS.md`
   - 主 repo 文件: `docs/superpowers/specs/2026-04-26-issue-shooter-stutter-design.md`、`docs/superpowers/plans/2026-04-26-issue-shooter-stutter.md`
   - Scanner repo: `google-apps-script/Code.gs`、`src/constants/schema.ts`、`src/utils/decoder.ts`、`src/i18n/locales/en.ts`、`src/i18n/locales/zh-TW.ts`

---
*Last updated: 2026-04-26 (Phase 46 — issueShooterStutter v1.8.0, 47 → 48 columns)*

---

## Session: 2026-04-26 (Part 2) — v1.9.0 Spec + Plan 寫好（實作未開始）

### Overview

使用者透過 `/full-workflow` 啟動完整工作流程，要求三件事：

1. **PostMatch 新增「其他」區段（含三題）：**
   - Q1: 需不需要球在自己 alliance zone（不需要 / 普通 / 很需要）
   - Q2: 會不會去對方 alliance zone 偷球（**boolean toggle**，不是 3 級評分 — 使用者明確選 C 方案）
   - Q3: 被 defense 對射球準確率影響（還好 / 普通 / 嚴重）

2. **Teleop 移除三欄 Counter：**
   - `bumpCount`（穿越 Bump 次數）
   - `trenchCount`（穿越 Trench 次數）
   - `fuelDroppedOnBumpCount`（穿越 Bump 時 Fuel 掉落）

3. **PostMatch 機器表現中 stuck on ball 改 stuck on fuel**（**只改 i18n label**，TSV/types key `flagStuckBall` 不動；中文用「卡在 fuel 上」）

**Schema 版本：** v1.8.0 (48 欄) → v1.9.0（仍 48 欄但結構大改：移 3 加 3 個欄位 + 改 1 個 i18n label）

本次 session 完成 brainstorming + writing-plans 兩個階段，**實作 0/17 tasks 尚未開始**。

---

### 完成項目

#### Brainstorming 階段（superpowers:brainstorming skill）
- ✅ 4 個釐清問題依序確認：
  1. 「偷球」用 boolean toggle 而非 3 級評分（使用者選 C）
  2. 「其他」區段獨立於既有的「機器異常」、「機器表現」、「碰撞」等區段
  3. Q1 / Q3 的 ratings 沿用既有的 good / ok / bad 字串值（與 RATING_ROW_KEYS 一致）
  4. stuck on ball 改 stuck on fuel **只改 label**，key `flagStuckBall` 保留（避免歷史包袱）
- ✅ Spec 完成並 commit `7acf323` — `docs/superpowers/specs/2026-04-26-postmatch-other-section-design.md`（370 行）

#### Writing-plans 階段（superpowers:writing-plans skill）
- ✅ Plan 完成並 commit `207d480` — `docs/superpowers/plans/2026-04-26-postmatch-other-section.md`（1343 行）
- ✅ Plan 結構：**17 tasks 跨 6 stages**
  - Stage A：主 repo schema / types / serializer 改動
  - Stage B：主 repo i18n + UI 改動
  - Stage C：主 repo verify + commit
  - Stage D：Scanner repo 同步（schema.ts / decoder.ts / Code.gs / i18n locales）
  - Stage E：程式化驗證 + scanner commit
  - Stage F：docs 更新 + 部署 checklist

#### Git history（D:\FRC\frc-6998-scouting-pass\FRC main branch）
- `7acf323` — docs(spec): add v1.9.0 PostMatch Other section + Teleop trim spec
- `207d480` — docs(plan): add v1.9.0 PostMatch Other section implementation plan

---

### 未完成項目（重要 — 避免明天誤判進度）

⚠️ **本次 session 僅產出 spec + plan 兩份文件，實作完全未開始。**

- ❌ 17 個 implementation tasks 全數**未執行**（0 / 17）
- ❌ 主 repo 任何程式碼檔案**未改動**：
  - `constants.ts`（schema 仍是 v1.8.0 = 48 欄 = 含 bumpCount / trenchCount / fuelDroppedOnBumpCount）
  - `types.ts`、`utils/checklistSerializer.ts`、`services/googleSheets.ts`
  - `contexts/LanguageContext.tsx`、`components/TabViews.tsx`、`components/HistoryEditForm.tsx`
- ❌ Scanner repo（`D:\FRC\frc-scout-scanner`）**今天完全未改動**
  - `google-apps-script/Code.gs` / `src/constants/schema.ts` / `src/utils/decoder.ts` / `src/i18n/locales/*.ts`
- ❌ 三方 schema 程式化驗證**未執行**
- ❌ 兩 repo build / commit / push（implementation commits）**未執行**
- ❌ 使用者外部部署：GAS 部署 v1.9.0 + fixHeaders + 端對端 QR 驗證**未執行**

---

### 修改檔案

僅兩個 docs 檔案 + 兩個 commits：
- `docs/superpowers/specs/2026-04-26-postmatch-other-section-design.md`（新增，commit `7acf323`）
- `docs/superpowers/plans/2026-04-26-postmatch-other-section.md`（新增，commit `207d480`）

**未改動**：所有 `.ts` / `.tsx` 程式碼檔案、`CLAUDE.md`（schema 描述仍標 v1.8.0 是正確的）。

---

### 4 個 Brainstorming 設計決策

| # | 議題 | 選擇 | 理由 |
|---|------|------|------|
| 1 | 「偷球」資料型別 | **boolean toggle**（不是 good / ok / bad） | 使用者選 C — 偷球這件事更像「會 / 不會」的二元行為，不是程度評分 |
| 2 | 「其他」區段位置 | **獨立區段** | 與既有的「機器異常」「機器表現」「碰撞」並列，不混入既有區塊 |
| 3 | Q1 / Q3 rating 字串值 | **沿用 good / ok / bad**（與 RATING_ROW_KEYS 一致） | 統一現有 rating 機制，serializer 不必特別處理新格式 |
| 4 | stuck on ball → stuck on fuel | **只改 i18n label，key `flagStuckBall` 不動** | 重構 key 跨 repo 成本太高（同 issueShooterOff 的歷史教訓 — 見 FINDINGS.md），純 cosmetic 變更不值得 |

完整脈絡見 spec：`docs/superpowers/specs/2026-04-26-postmatch-other-section-design.md`

---

## 5-Question Reboot Check（給明日接續用）

1. **做什麼？** Phase 47：v1.9.0 schema 改造 — PostMatch 新增「其他」區段（3 題）、Teleop 移除 3 欄 Counter、stuck on ball → stuck on fuel label 改字
   - 狀態：**spec + plan 已寫好；實作 0 / 17 tasks 未開始**
2. **進度？** spec + plan 已 commit 到主 repo origin/main（`7acf323` + `207d480`）；implementation 尚未啟動；scanner repo 完全未動
3. **下一步？**
   - **(a) 先請使用者選執行模式**：上次 session 結束前 present 了兩個選項但使用者沒回覆就 `/finish` —
     - **Subagent-Driven**（每 task 派 subagent 執行）
     - **Inline Execution**（在 main session 內直接執行；上次推薦此模式）
   - **(b) 確認模式後從 plan 的 Task 1 開始** — 修 `constants.ts` 的 `TSV_SCHEMA_MATCH`（移除 bumpCount / trenchCount / fuelDroppedOnBumpCount，新增 otherStealsOpponent / ratingNeedFuel / ratingShotUnderDefense）
4. **阻礙？** 等使用者選執行模式（Subagent-Driven vs Inline Execution）
5. **檔案？**
   - **Spec**：`docs/superpowers/specs/2026-04-26-postmatch-other-section-design.md`
   - **Plan**：`docs/superpowers/plans/2026-04-26-postmatch-other-section.md`（17 tasks 詳細步驟，含每 task 的修改範圍 / 驗證指令 / commit 訊息範本）
   - 待改主 repo 檔案：`constants.ts`、`types.ts`、`utils/checklistSerializer.ts`、`services/googleSheets.ts`、`contexts/LanguageContext.tsx`、`components/TabViews.tsx`、`components/HistoryEditForm.tsx`
   - 待改 scanner repo 檔案：`google-apps-script/Code.gs`、`src/constants/schema.ts`、`src/utils/decoder.ts`、`src/i18n/locales/en.ts`、`src/i18n/locales/zh-TW.ts`

---

*Last updated: 2026-04-26 (Phase 47 — v1.9.0 spec + plan 寫好，實作未開始)*

---

## Session: 2026-04-26 (Part 3) — v1.9.0 實作完成（Inline Execution）

### Overview

接續 Part 2 的 spec + plan，本段 session 用 `superpowers:executing-plans` skill + Inline Execution 模式完整實作 17 tasks。從 Stage A 改 schema/types/serializer，到 Stage B 改 i18n + UI，到 Stage D scanner 同步，到 Stage F 文件更新 — 全程一次完成，4 commits 跨 2 repos 全數 push 到 origin/main。

---

### Phase 47: v1.9.0 PostMatch「其他」區段 + Teleop 三欄移除（實作）
- **Status:** ✅ complete
- **Completed:** 2026-04-26

#### 主 repo 改動 (8 檔；分 2 commits)

**Stage A commit (`42425fa`) — schema/types/serializer**
- `constants.ts`: TSV_SCHEMA_MATCH 移 3 (bumpCount/trenchCount/fuelDroppedOnBumpCount) 加 3 (otherStealsOpponent/ratingNeedFuel/ratingShotUnderDefense) + v1.9.0 註解
- `types.ts`: ScoutingData/INITIAL_DATA 同步移加；PostMatchChecklist 加 `stealsOpponent: boolean` + ratings.{needFuel, shotUnderDefense}
- `utils/checklistSerializer.ts`: 拆 RATING_ROW_KEYS → MAIN_RATING_ROW_KEYS (8) + OTHER_RATING_ROW_KEYS (2) + 全部 RATING_ROW_KEYS spread；checklistToFlatFields 加 `out.otherStealsOpponent = c.stealsOpponent`

**Stage B commit (`61364c7`) — i18n + UI**
- `services/googleSheets.ts`: PRESERVE_EMPTY_KEYS += ratingNeedFuel + ratingShotUnderDefense
- `contexts/LanguageContext.tsx`: 移 3 (EN+ZH) + flag_stuckBall「Stuck on fuel」/「卡在 fuel 上」+ 加 10 keys per locale（4 主 keys + 6 per-row button labels）
- `components/TabViews.tsx` Teleop: 移除整段 `<div className="grid grid-cols-1 gap-5">` 含 3 個 Counter
- `components/TabViews.tsx` PostMatchTab: import 改 MAIN/OTHER + showOther state + fallback 補齊全部 ratings + stealsOpponent + ratings render 從 RATING_ROW_KEYS 改 MAIN_RATING_ROW_KEYS + 加完整「其他」可摺疊區段（Toggle + 2 rating rows with per-row tKey labels）
- `components/HistoryEditForm.tsx`: 移除 3 個 Counter input field

#### Scanner repo 改動 (5 檔；1 commit `605071b`)
- `src/constants/schema.ts`: TSV_SCHEMA_MATCH 移 3 加 3 + 檔頭 v1.9.0 註解 + flag_stuckBall 簡中改「卡 fuel」+ FIELD_LABELS 移 3 加 3 + SCHEMA_LENGTHS 註解 47→48
- `src/utils/decoder.ts`: 註解 v1.8.0→v1.9.0（detectQRType 已動態 .length 比對，邏輯不需改）
- `src/i18n/locales/en.ts`: header 註解 + 移 3 + 加 3 + flagStuckBall 'Stuck on fuel' + // Teleop comment 改 // Penalty + Climb
- `src/i18n/locales/zh-TW.ts`: 同上 + 「卡在 fuel 上」
- `google-apps-script/Code.gs`: 檔頭 changelog + TSV_SCHEMA_MATCH 移 3 加 3 + 全部欄位編號註解重編 + flag_stuckBall 註解 label 標 v1.9.0 + version '1.8.0'→'1.9.0' + 測試資料清理 (1 multi-line + 12 inline 行)

#### Code.gs 編輯技巧
- 12 個 inline 重複行 + 1 個 multi-line block 用 single-Edit 容易 collision，改用一次性 node regex 批次處理（`node -e` script 跑 string.replace + writeFileSync）
- CRLF 檔案 + multiline regex 有副作用：`^\s*` 會吃掉前一行的 `\n`，需手動 fix 1 行（補回 `\n`）

#### 程式化驗證腳本（一次性，跑完已刪除）
位置：`FRC/scripts/verify-v1.9.cjs`（commit 前刪掉）
- 解析 main constants.ts / scanner schema.ts / Code.gs 三方 TSV_SCHEMA_MATCH array
- 驗證：三方 length 都 48、欄位逐一 idx 對齊、移除欄位三方都消失、新增欄位三方 idx 一致
- 修了一個 parser bug：原版 plan 範例只認 multi-line 寫法（每行一個 `'xxx',`），對 main 的 inline 寫法（一行多個）會漏算。改用 `matchAll(/['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]/g)` 解所有 quoted identifier

#### 驗證結果
```
main length:     48
gas length:      48
scanner length:  48
main vs gas    : OK
main vs scanner: OK

Removed (must NOT exist):
  bumpCount                    main: OK gas: OK scanner: OK
  trenchCount                  main: OK gas: OK scanner: OK
  fuelDroppedOnBumpCount       main: OK gas: OK scanner: OK

Added (must exist at same idx):
  otherStealsOpponent          main idx: 44 gas: 44 scanner: 44 OK
  ratingNeedFuel               main idx: 45 gas: 45 scanner: 45 OK
  ratingShotUnderDefense       main idx: 46 gas: 46 scanner: 46 OK
```

#### 部署順序
1. ✅ 主 repo 6 commits 已 push (4 docs from Part 2 + Stage A + Stage B)
2. ✅ Scanner repo 1 commit (`605071b`) 已 push
3. ⏸ 使用者：把 scanner 最新 `google-apps-script/Code.gs` 覆貼到 GAS project → 部署新版（version 1.9.0）
4. ⏸ 使用者：對每個活躍 Sheet GET `<webAppUrl>?action=fixHeaders` 升級到 48 欄新順序標頭（**必跑**：本次欄位順序大改）
5. ⏸ 使用者：端對端 QR 掃描驗證

#### 觀察 / 學習
- **Inline Execution 流暢度**：用 `superpowers:executing-plans` skill 全程一次跑完 17 tasks 沒打斷。Plan 17 tasks 詳細到 step 級別，配合 TaskCreate 追蹤每 task 進度，沒踩任何 baseline-noise vs 新錯誤的混淆陷阱
- **TS type check 策略**：`npm run build` (Vite) 不跑 TS type check，需 `npx tsc --noEmit` 才能驗 type 錯誤。Inline Execution 在 Stage A 改完才跑 type check 是對的 — 中間每改 1 檔跑會有大量「預期會錯的」噪音
- **Baseline noise 避坑**：v1.9.0 改前已有 13 個預存 TS errors（App.tsx useRef/MatchLevel unused、googleSheets index errors 等）。Stage A commit 前先用 `git stash` 跑 baseline tsc 算 error 數，作為比對基準避免誤判
- **CRLF + JS regex 多行 bug**：`^\s*xxx,\r?\n\s*yyy,...` 在 multiline mode + CRLF 檔案會把前一行的 `\n` 也吃掉。原因是 `\r` 也是 line terminator，`^` 會在 `\r` 之後 activate，導致 `\s*` 跨越 `\n` 邊界。修法：刪除後手動 fix 受影響的 1 行
- **Verifier parser 必須兼容 inline 和 multi-line array 寫法**：原 plan verifier 只解 multi-line（每行一個 `'xxx',`），對 main constants.ts 的 inline 寫法只解 16/48 個欄位。修法：用 regex `matchAll` 直接抽 quoted identifier 跨任意排版

---

## 5-Question Reboot Check（給明日接續用）

1. **做什麼？** Phase 47 v1.9.0 完整實作 — PostMatch 加「其他」區段 (3 欄)、Teleop 移 3 欄、flag_stuckBall label 改名
2. **進度？** ✅ 全部 17 tasks 完成；兩 repo 共 4 implementation commits + 4 docs commits 已 push 到 origin/main；主 repo build (Vite) 過，scanner build 過；三方 schema 程式化驗證通過 (48/48/48 OK + 移除欄位三方消失 + 新增欄位 idx 44/45/46 一致)
3. **下一步？** 使用者外部手動操作（同 v1.7.0/v1.8.0 部署流程）：
   - (a) 把 scanner 最新 `google-apps-script/Code.gs` 覆貼到 GAS project → 部署新版（內部版本字串應顯示 1.9.0）
   - (b) 對每個活躍 Sheet GET `<webAppUrl>?action=fixHeaders`（**必跑** — 本次欄位順序大改）
   - (c) 端對端 QR 掃描驗證（48 欄 Match QR 解碼成功 + 偷球 toggle 輸出 1 + 需要球/被 defense 評分輸出 good/ok/bad）
4. **阻礙？** 無；僅外部部署待使用者執行
5. **檔案？**
   - 主 repo: `constants.ts`、`types.ts`、`utils/checklistSerializer.ts`、`services/googleSheets.ts`、`contexts/LanguageContext.tsx`、`components/TabViews.tsx`、`components/HistoryEditForm.tsx`、`CLAUDE.md`、`PROGRESS.md`
   - Scanner repo: `google-apps-script/Code.gs`、`src/constants/schema.ts`、`src/utils/decoder.ts`、`src/i18n/locales/en.ts`、`src/i18n/locales/zh-TW.ts`

---

*Last updated: 2026-04-26 (Phase 47 — v1.9.0 PostMatch Other section + Teleop trim 實作完成)*
