# Findings & Decisions

## Project Status

> **重要更新 (2026-01-23):** FRC Video Analyzer 已分離為獨立專案
> - 新位置: `D:\frc-video-analyzer`
> - GitHub: https://github.com/0908869905/frc-video-analyzer

本專案 (Scouting PASS) 現為純人工 scouting 應用。

---

## Requirements (Scouting PASS)

- FRC 6998 比賽 scouting 應用 (2026 REBUILT)
- 支援 PreMatch → Auton → Teleop → **Penalty** → PostMatch 流程
- **雙 QR Code**: Match Data + Auto Path 分離
- TSV 匯出 + Google Sheets 自動上傳
- 離線優先 (localStorage)
- 雙語支援 (English/繁體中文)

---

## Technical Decisions (Scouting PASS)

| Decision | Rationale |
|----------|-----------|
| React + TypeScript + Vite | 現代化前端堆疊，快速開發 |
| Tailwind CSS (CDN) | 無需建置，快速樣式開發 |
| localStorage 離線優先 | 比賽場地網路不穩定 |
| LZ-String 壓縮 | QR Code 資料量限制 |
| Google Apps Script | 免費、簡單的後端替代方案 |
| Capacitor (非 React Native) | 現有程式碼不需重寫，直接打包成 iOS App |
| PWA | 支援「加入主畫面」，離線快取 |
| Vercel 部署 | 免費、自動 CI/CD、全球 CDN |
| 防呆驗證 | 阻止無效資料進入下一階段，減少 scouting 錯誤 |

---

## 2026 REBUILT 重構決策 (2026-01-25)

| Decision | Rationale |
|----------|-----------|
| `robotPosition` → `alliance` | 簡化為 Red/Blue 2 選項，隊號改為手動輸入 |
| 新增 Penalty 階段 | 犯規資訊獨立追蹤 (penaltyCount, yellowCard, redCard) |
| Stopwatch 組件 | 攀爬時間需要精確計時，提供碼表 UI (精度: 0.01 秒) |
| 分離 Auto Path QR | 路徑座標資料量大，獨立 QR 避免主 QR 過於複雜 |
| `TSV_SCHEMA_PATH` | 路徑 QR 僅包含 eventCode, matchNumber, teamNumber, autoPath |
| autoClimbStatus/teleClimbStatus | 明確區分 Auto (Level1/Failed/None) 和 Teleop (Level1-3/Failed/None) |
| almostTipped (取代 tippedOver) | 更精確描述「差點翻車」vs「已翻車」|

---

## Teleop UI 與攀爬優化 (2026-01-28)

| Decision | Rationale |
|----------|-----------|
| Teleop 順序：Bump → Fuel → Penalty → Climb | 攀爬通常在比賽最後進行，順序符合實際操作流程 |
| 犯規計數器化 (minor/major → number) | 同一場比賽可能多次犯規，用計數器更精確 |
| 移除 penaltyCount | 冗餘欄位，minor + major 即可計算總數 |
| ClimbPosition 改為 5 選項 | LeftSide/Left/Center/Right/RightSide 整合位置與側邊資訊 |
| 移除 ClimbSide enum | 與 ClimbPosition 重複，整合到單一欄位減少複雜度 |
| 移除 autoClimbSide/teleClimbSide | 攀爬側資訊已整合於 ClimbPosition |
| TSV Schema: 18 欄位 | 移除冗餘欄位後的精簡結構 |

---

## Video Analyzer (已分離)

以下內容已移至 `D:\frc-video-analyzer` 專案：

### 技術棧
- **前端**: React + TypeScript + Vite + Tailwind
- **後端**: Python 3.11 + FastAPI + PyTorch
- **電腦視覺**: SAM + ByteTrack + RIFE

### 部署架構
```
┌─────────────────────┐     ┌──────────────────────┐
│  Vercel (前端)       │────▶│  後端 (自架/Railway)  │
│  React SPA          │     │  Python + GPU        │
└─────────────────────┘     └──────────────────────┘
```

### 相關文件
- 專案目錄: `D:\frc-video-analyzer`
- GitHub: https://github.com/0908869905/frc-video-analyzer
- README: `D:\frc-video-analyzer\README.md`

---

## Resources

### Scouting PASS 文件
- **主入口**: `App.tsx`
- **類型定義**: `types.ts`
- **常數配置**: `constants.ts`
- **多語言**: `contexts/LanguageContext.tsx`
- **iOS 設定**: `capacitor.config.ts`
- **PWA 設定**: `public/manifest.json`, `public/sw.js`

### 部署連結
- **Web App**: https://frc-ten.vercel.app
- **GitHub**: https://github.com/0908869905/FRC
- **App Store Connect**: https://appstoreconnect.apple.com

### 參考連結
- Vite: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/
- Capacitor: https://capacitorjs.com/
- React QR Code: https://github.com/rosskhanas/react-qr-code
- LZ-String: https://github.com/pieroxy/lz-string

---

## FieldCanvas 與 Scanner App 路徑比例對齊 (2026-01-30)

### 問題
FieldCanvas 繪製的路徑在 scanner app (frc-scout-scanner) 中顯示比例不一致。

### 原因
兩邊的渲染邏輯不同：
- **Scanner**: SVG viewBox `0 0 200 100`，container `aspectRatio: '2/1'`，`object-fill`
- **FieldCanvas**: Canvas 繪製，`object-cover`，固定像素線寬/圓點大小

### 解決方案
將 FieldCanvas 的所有繪製參數改為基於 canvas 高度的比例值，匹配 scanner 的渲染行為：

| 參數 | 修改前 | 修改後 |
|------|--------|--------|
| 圖片填充 | `object-cover` | `object-fill` |
| 線寬 | 6px (固定) | `height × 1.5%` |
| 起/終點半徑 | 10px (固定) | `height × 2%` |
| 中間點半徑 | 無 | `height × 1%` |
| 邊框線寬 | 2px (固定) | `height × 0.5%` |
| 起點樣式 | 綠色填充 | 青色填充+白色邊框 |
| 終點樣式 | 紅色填充 | 白色填充+青色邊框 |
| 線條透明度 | 1.0 | 0.9 |

### 選擇理由
- 使用比例值而非固定像素，確保在不同螢幕尺寸下路徑視覺效果一致
- 樣式統一為青色系（`#00CED1`），與 scanner app 的 SVG stroke 顏色匹配
- 新增中間點顯示，讓路徑走向更清晰

---

## App Store 上架準備決策 (2026-02-01)

### 問題：CDN 依賴阻擋 App Store 上架
iOS App 透過 Capacitor 打包時，CDN 資源（Tailwind CSS、Google Fonts）無法在離線環境載入，且 App Store 審核要求所有資源本地化。

### 解決方案

| Decision | Rationale |
|----------|-----------|
| Tailwind CDN → `tailwindcss` + `@tailwindcss/vite` | 本地 build 消除運行時 CDN 依賴，CSS 打包到 dist (52.69 KB) |
| `@theme` 品牌色定義在 `styles.css` | 取代 `index.html` 內的 `tailwind.config` script，Vite plugin 原生支援 |
| Google Fonts → `@fontsource/inter` + `@fontsource/orbitron` | 字體檔案打包到 dist，離線完全可用 |
| `@capacitor/haptics` 觸覺回饋 | Counter 遞增/遞減時觸發 impact，提升 native 體感 |
| `@capacitor/splash-screen` + `@capacitor/status-bar` | App 啟動動畫 + 狀態列外觀控制，符合 iOS 原生 App 體驗 |
| SW 註冊加入 `!window.Capacitor` 判斷 | 避免 native app 環境重複註冊 Service Worker，Capacitor 有自己的離線機制 |
| `public/privacy.html` 隱私政策 | App Store 審核必要條件，說明資料收集與使用方式 |

### 選擇理由
- **零 CDN 依賴**：build 後 `dist/index.html` 完全自包含，適合 Capacitor 打包
- **bundle 大小可控**：CSS 52.69 KB + JS 231.81 KB，行動端載入無壓力
- **開發體驗不變**：`npm run dev` 仍然支援 HMR，Tailwind Vite plugin 編譯速度快

---

## Scouting Pass 欄位與驗證調整 (2026-02-02)

### 問題 1: Team Number 上限過於嚴格
- **原規則**: 1-9999 整數
- **問題**: 部分 FRC 隊號超過 9999（如五位數隊號）
- **新規則**: 正整數（> 0 的整數，無上限）
- **選擇理由**: FRC 官方隊號持續增長，硬編碼上限會排除合法隊伍

### 問題 2: Bump 和 Trench 合併計數不夠精確
- **原設計**: `bumpTrenchCount` 單一計數器
- **問題**: Bump（衝撞）和 Trench（溝渠）是不同的場地動作，合併無法區分
- **新設計**: 拆分為 `bumpCount` + `trenchCount` 兩個獨立計數器
- **影響**: TSV_SCHEMA_MATCH 從 20 欄位增為 21 欄位
- **選擇理由**: 分開記錄讓分析更精確，scouter 可以獨立追蹤每種動作次數

### 問題 3: 起始區域 Offset 不準確
- **原值**: Red=21%, Blue=72%, Width=3.5%
- **問題**: 場地圖更新後，起始區域位置偏移
- **新值**: Red=25%, Blue=68%, Width=3.5%
- **選擇理由**: 多次目視校準，確保綠色半透明區域精確覆蓋場地圖上的起始區域

### 問題 4: Path QR 缺少 Alliance 資訊
- **原設計**: TSV_SCHEMA_PATH = [eventCode, matchNumber, teamNumber, autoPath] (4 欄位)
- **問題**: Scanner 無法判斷路徑是紅方還是藍方
- **新設計**: TSV_SCHEMA_PATH = [eventCode, matchNumber, teamNumber, alliance, autoPath] (5 欄位)
- **選擇理由**: Alliance 資訊對路徑分析至關重要，紅藍方的場地方向不同

### 問題 5: Climb None 時殘留無效資料
- **問題**: 切換 climb status 為 None 後，time 和 position 仍保留舊值
- **解決**: 當 climb status 改為 None 時，自動重置 time=0, position=Center
- **選擇理由**: 避免 TSV 匯出包含無意義的攀爬時間和位置

| Decision | Rationale |
|----------|-----------|
| 隊號改為正整數驗證 | FRC 隊號持續增長，不應硬編碼上限 |
| bumpTrenchCount → bumpCount + trenchCount | 不同動作分開記錄，分析更精確 |
| 起始區域 Red=25%, Blue=68% | 目視校準匹配場地圖 |
| Path QR 加入 alliance | Scanner 需要知道路徑方向 |
| Climb None 自動重置 | 避免無效資料殘留 |
| "Riding on Ball" → "Riding on Fuel" | 正確對應遊戲元素名稱 |

---

## Path QR Code Douglas-Peucker 壓縮 (2026-02-04)

### 問題
Auto Path QR Code 包含大量路徑座標點，導致 QR Code 資料量過大。典型路徑（61 點）生成 628 字元的座標字串，接近 QR Code 容量限制。

### 解決方案：Douglas-Peucker 路徑簡化演算法

| 方案 | 優點 | 缺點 |
|------|------|------|
| **Douglas-Peucker** (選用) | 保留路徑形狀特徵、壓縮率高、演算法成熟 | 需要選擇 epsilon 參數 |
| 固定間隔取樣 | 實作簡單 | 可能遺失轉彎等關鍵點 |
| Bezier 曲線擬合 | 數據最小 | 解碼端需要額外計算 |
| 僅降低座標精度 | 無損路徑點數 | 壓縮率有限 |

### 選擇理由
1. **保留形狀特徵**: Douglas-Peucker 會自動保留轉彎點、起點、終點，移除直線段上的冗餘點
2. **高壓縮率**: 實測 61 點 → 11 點（82% 點數減少），628 字元 → 84 字元（87% 資料減少）
3. **Scanner 端零改動**: 輸出格式仍為 `x,y|x,y|...`，只是點數更少
4. **搭配整數座標**: 原本使用浮點百分比（如 `45.23,67.89`），改為整數（如 `45,68`），每個座標再省 3-5 字元

### 實作細節
- **Epsilon 值**: 2（百分比單位），約等於場地圖 2% 的偏差容忍度
- **遞迴簡化**: 找到離線段最遠的點，若距離 > epsilon 則保留該點並遞迴處理兩側
- **起點/終點**: 永遠保留
- **函數**: `simplifyPath(points, epsilon)` 已 export，可供其他模組使用
- **位置**: `services/googleSheets.ts`

### 壓縮效果數據
| 指標 | 壓縮前 | 壓縮後 | 減少比例 |
|------|--------|--------|----------|
| 路徑點數 | 61 | 11 | 82% |
| 字元數 | 628 | 84 | 87% |
| 平均每點字元 | 10.3 | 7.6 | 26% |

---

## Stopwatch animate-pulse 視覺衝突 (2026-02-05)

### 問題
Teleop 碼表在運行時出現「原始的秒數留在底層，新的秒數在上層」的雙重數字重疊現象。

### 原因
`animate-pulse` 動畫與高頻 DOM 更新產生衝突：
- **animate-pulse 行為**: Tailwind 的 `animate-pulse` 約 2 秒週期，包含 opacity 變化（100% → 75% → 100%）和輕微 scale 變換
- **Stopwatch 更新頻率**: `setInterval` 每 10ms 更新一次時間顯示
- **衝突機制**: 當 DOM 文字內容快速更新時，瀏覽器的 CSS 動畫渲染與 DOM 重繪疊加，造成舊文字的「殘影」與新文字同時可見

### 解決方案
移除時間數字上的 `animate-pulse`，改用獨立的紅色閃爍圓點作為運行狀態指示器。

| 方案 | 優點 | 缺點 |
|------|------|------|
| **獨立閃爍圓點** (選用) | 圓點無需快速更新，動畫穩定；數字清晰無殘影 | 視覺效果稍弱 |
| 降低更新頻率 | 減少衝突機率 | 犧牲計時精度（0.01秒顯示需要高頻更新） |
| 使用 CSS transform | 可能改善渲染 | 仍可能有殘影，不保證解決 |
| 禁用硬體加速 | 簡化渲染管線 | 可能影響整體效能 |

### 選擇理由
1. **根本解決**: 完全分離「動畫元素」和「高頻更新元素」，從架構上避免衝突
2. **零副作用**: 計時精度不受影響，仍保持 10ms 更新
3. **視覺清晰**: 用戶明確看到「紅點閃爍 = 計時中」的狀態指示
4. **跨瀏覽器穩定**: 避免依賴特定瀏覽器的渲染優化行為

### 適用場景
任何需要 **CSS 動畫** + **高頻 DOM 更新** 共存的場景，都應避免將動畫直接應用於會快速更新內容的元素。

---

## Scouting PASS UX 改進設計決策 (2026-02-05)

### 設計原則
針對 FRC 比賽 scouting 的特殊場景（快節奏、行動裝置、可能離線）進行 UX 優化。

### 決策紀錄

| 功能 | 決策 | 理由 |
|------|------|------|
| 震動確認提交 | `utils/haptics.ts` 封裝，支援 Capacitor 和 Web API | 統一 native/web 觸覺體驗，提交成功有明確回饋 |
| 自動保存指示器 | 獨立 `AutoSaveIndicator.tsx` 組件 | 減少用戶焦慮，確認資料已保存 |
| Scouter 名稱記憶 | localStorage `recent_scouters` 儲存最近 3 個 | 同一 scouter 重複使用同裝置，避免每次重新輸入 |
| 比賽時間提示 | Settings 可開關，預設關閉 | 部分 scouter 覺得分心，提供彈性 |
| 滑動手勢導航 | `useSwipeNavigation` hook + `data-swipe-ignore` 排除機制 | 行動裝置友善，但需排除繪圖區域避免衝突 |
| TBA 賽程資料 | 本地內建 `data/events2026.ts` + `data/eventSchedule.ts` | 離線環境可用，不依賴即時 API |
| 歷史記錄編輯 | `updateMatchRecord` + `getMatchRecord` 函數 | 修正輸入錯誤，避免重新 scouting 整場比賽 |

### 架構選擇

#### 滑動手勢與繪圖區衝突
- **問題**: 滑動手勢會干擾 FieldCanvas 路徑繪製
- **解決**: 在 `FieldCanvas.tsx` 根元素添加 `data-swipe-ignore` 屬性
- **機制**: `useSwipeNavigation` 檢查 target 是否有此屬性或是其子元素，有則忽略手勢

#### TBA 資料離線策略
- **問題**: 比賽場地可能無網路，無法即時查詢 TBA API
- **解決**: 預先內建 2026 賽事列表和賽程資料
- **更新時機**: 賽季初公布後手動更新 `data/` 目錄下的檔案
- **待辦**: 若有 TBA API Key，可加入即時 fetch 作為補充

#### localStorage Keys 設計
| Key | 格式 | 說明 |
|-----|------|------|
| `recent_scouters` | `string[]` (JSON) | 最多保留 3 個，FIFO |
| `match_timer_enabled` | `"true" \| "false"` | 計時器開關 |

### 錯誤處理

#### CloudCheck 圖示不存在
- **症狀**: `CloudCheck` 圖示 import 錯誤
- **原因**: lucide-react 沒有 `CloudCheck` 圖示
- **解決**: 改用 `Cloud` 圖示

#### Alliance 重複 import
- **症狀**: TypeScript 報錯重複 import
- **原因**: 複製貼上時重複引入 `Alliance` type
- **解決**: 移除重複的 import 行

---

## 全螢幕場地圖三項修復 (2026-02-09)

### 問題 1: 全螢幕尺寸計算不可靠
- **症狀**: 手機上進入全螢幕後場地圖尺寸異常（過小或錯位）
- **原因**: 使用 `fullscreenRef` + double `requestAnimationFrame` 量測 DOM 尺寸，時機依賴瀏覽器渲染排程，在手機上經常在 DOM 還未完成 layout 時就量測
- **解決**: 在點擊全螢幕按鈕時直接用 `window.innerWidth` / `window.innerHeight` 計算尺寸，移除 `fullscreenRef`
- **選擇理由**: `window.innerWidth/Height` 是同步可用的，不依賴 DOM 渲染完成，第一次渲染就能拿到正確尺寸

### 問題 2: 全螢幕 z-index 被父層覆蓋
- **症狀**: 進入全螢幕後，header 和 footer（Next/Prev 按鈕）仍顯示在全螢幕 overlay 之上
- **原因**: 全螢幕 overlay 渲染在 `<main>` 內部，而 `<main>` 有 `overflow-y-auto`，這會建立新的 stacking context。overlay 的 `z-index: 50` 只在 `<main>` 的 stacking context 內有效，無法與外層的 header/footer 競爭
- **解決**: 使用 React `createPortal(overlay, document.body)` 直接渲染到 `<body>`，跳出父層 stacking context

| 方案 | 優點 | 缺點 |
|------|------|------|
| **React Portal** (選用) | 完全跳出父層 stacking context，z-index 在全域生效 | 需要 import createPortal |
| 提高 z-index 值 | 簡單 | 無法解決，因為 stacking context 隔離問題不是 z-index 值大小的問題 |
| 移除 overflow-y-auto | 解決 stacking context | 破壞頁面滾動功能 |

- **選擇理由**: React Portal 是 React 官方推薦的方式處理 modal/overlay 類元素，從根本上解決 stacking context 問題

### 問題 3: 全螢幕碼錶不顯示
- **症狀**: 進入全螢幕後看不到碼錶（Stopwatch），即使已選擇攀爬狀態
- **原因**: `TabViews.tsx` 中 `onClimbTimeChange` 只在 `autoClimbStatus !== 'None'` 時才傳入 FieldCanvas。當碼錶在全螢幕中渲染時，如果使用者尚未選擇攀爬狀態，碼錶 prop 為 undefined 導致不渲染
- **解決**: 永遠傳入 `climbTime` 和 `onClimbTimeChange`，讓全螢幕碼錶始終可見
- **選擇理由**: 使用者可能想在全螢幕中操作碼錶，不應受外部狀態限制

### 適用場景
- **DOM 量測替代方案**: 當需要全螢幕尺寸時，優先使用 `window.innerWidth/Height` 而非 ref 量測，避免時序問題
- **React Portal 應用場景**: 任何需要脫離父層 CSS 限制的 overlay/modal/tooltip 都應考慮使用 Portal
- **Prop 傳遞原則**: 子組件的功能不應被父組件的條件邏輯意外截斷，特別是 UI 可見性相關的 prop

---

## PWA orientation 限制導致 Android 無法橫向 (2026-02-10)

### 問題
Android PWA 加到主畫面後，無法旋轉到橫向模式，導致全螢幕場地圖無法利用橫向空間。

### 原因
`manifest.json` 設定了 `"orientation": "portrait"`，在 Android PWA 模式下強制鎖定為直向。一般瀏覽器不受此設定影響，但「加到主畫面」後的 PWA 會嚴格遵守 manifest 的 orientation 限制。

### 解決方案
將 `"orientation": "portrait"` 改為 `"orientation": "any"`，允許使用者自由旋轉裝置。

### 選擇理由
- 全螢幕場地圖在橫向模式下有更大的繪圖空間，是核心使用場景
- `"any"` 而非移除 orientation 鍵，保持 manifest 結構完整性
- iOS PWA 不受此設定影響（iOS 透過 meta viewport 控制）

---

## 移除 PhaseTimeIndicator 計時器的架構清理 (2026-02-10)

### 問題
Auto/Teleop 階段的倒數計時器（PhaseTimeIndicator）功能被決定移除。

### 影響範圍
移除涉及多層架構：
1. **組件**: `components/ui/PhaseTimeIndicator.tsx` — 整個檔案刪除
2. **State**: `App.tsx` 的 `showMatchTimer` state — 移除
3. **Props**: `TabViews.tsx` 的 `showMatchTimer` prop 傳遞鏈 — 移除
4. **Settings UI**: Settings 面板中的 Match Timer Toggle — 移除
5. **localStorage**: `match_timer_enabled` key — 不再寫入/讀取
6. **翻譯鍵**: 相關 i18n keys（如有）

### 清理原則
- **由外而內**: 先移除 state 持有者 (App.tsx)，再移除使用者 (TabViews.tsx)，最後刪除組件檔案
- **localStorage**: 舊版本寫入的 `match_timer_enabled` key 不需要主動清除，只要代碼不再讀取即可
- **確認無引用**: 刪除檔案前用 grep 確認沒有其他地方 import 該組件

---
*Last updated: 2026-02-10*
*Note: Video Analyzer 相關內容已移至獨立專案*
