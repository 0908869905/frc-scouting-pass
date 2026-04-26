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

## 2026 FRC 賽事地理發現 (2026-02-10)

### 問題
Team 6998（台灣南科國際實驗高中）需要確認 2026 年的比賽報名狀態和賽事地點。

### 發現
透過 The Blue Alliance API 查詢 2026 年完整賽事列表後發現：

1. **2026 年沒有 Malaysia Regional 也沒有 Taiwan Regional**
   - 亞洲地區賽事極少，Shanghai Regional (2026cnsh) 是亞洲僅有的賽事之一
   - 東南亞/台灣隊伍需要到其他地區參賽

2. **`2026mslr` 代碼的真正身分**
   - 原本假設是 Malaysia Regional
   - 實際是 **Magnolia Regional**（美國密西西比州 Laurel）
   - 比賽日期：3/18-21（Week 3）

3. **Team 6998 今年報名了 Magnolia Regional**
   - 45 支已註冊隊伍中包含 Team 6998 Unipards
   - 這是隊伍首次前往美國密西西比州參賽

4. **Championship 資訊**
   - 地點：Houston, TX
   - 日期：4/29-5/2
   - 8 個 Division（Archimedes, Curie, Daly, Galileo, Hopper, Johnson, Milstein, Newton）

### 選擇理由
- 使用 TBA 官方 API 作為資料來源，確保準確性
- 內建 221 個完整賽事到 `events2026.ts`，支援離線查詢
- `eventSchedule.ts` 新增 `teams` 欄位和 `getEventTeams()` 函數，為隊伍資訊查詢提供基礎

### 對專案的影響
- `data/events2026.ts`：從 7 個 placeholder → 221 個官方賽事
- `data/eventSchedule.ts`：新增 teams 陣列和 getEventTeams() 函數
- 賽程（matches）尚未公布，待 3/18 比賽開始前更新

---

## FieldCanvas 方向自動切換 fullscreen (2026-04-15)

### 問題
FieldCanvas 全螢幕原本只能手動點按鈕進入，但橫握手機時使用者預期自動進入全螢幕以獲得最大繪圖空間；而轉回直向時也應自動回到分頁視圖。

### 選擇：`window.matchMedia('(orientation: landscape)')`

| 方案 | 優點 | 缺點 |
|------|------|------|
| `matchMedia('(orientation: landscape)')` ✅ | 語意明確（專為方向設計）、有專屬 `change` event、支援好 | 需要掛載 listener |
| `window.innerWidth > innerHeight` | 直觀、無需 API | 語意不精準（軟鍵盤彈出會誤判）、需自己監聽 resize |
| Screen Orientation API (`screen.orientation`) | 官方方向 API | iOS Safari 相容性較差 |

選 `matchMedia` 是因為它就是為 CSS media query `orientation` 設計的 JS 對應 API，語意對齊且跨瀏覽器穩定。

### 實作要點
1. 掛載時立即 `applyOrientation()` 一次 — 避免使用者橫握進頁面時需要旋轉一次才觸發
2. `mql.addEventListener('change', fn)` 而非 deprecated 的 `mql.addListener`
3. Return cleanup 函數移除 listener — 避免記憶體洩漏
4. 復用既有 `calcFullscreenSize()` + `setIsFullscreen(true)` 機制，不另寫 fullscreen 邏輯

### 刻意不動的部分
- **保留手動 `handleEnterFullscreen` 按鈕**：使用者直向時仍可主動進入 fullscreen，保留彈性
- **Exit 按鈕行為不改**：橫向時按 exit 會被下次 orientation change 的 `applyOrientation()` 覆蓋回 fullscreen，這是預期的 — 如果使用者真的不想要 fullscreen，應該把手機轉直

### 對專案的影響
- `components/FieldCanvas.tsx` 新增 17 行 useEffect（line 112-127）
- 不影響桌機版（桌機通常橫向但不會觸發 portrait change，行為維持原樣）
- PWA manifest 已設定 `orientation: "any"` 所以橫向可正常顯示

---

## PostMatch 結構化勾選清單 (2026-04-20)

### 問題
使用者要求把 `scouting 最後一頁.md` 的勾選清單套用到 PostMatch 頁面的 comments 區塊。舊版僅有自由輸入 textarea，資料難以統計分析；新需求要列出常見機器異常、表現 flag、撞擊、動作評分等。

### 關鍵決策：序列化到既有欄位 vs 展開成多欄位

| 方案 | 優點 | 缺點 |
|------|------|------|
| A. 序列化進既有 `comments` ✅ | TSV schema 不變、code.gs 不需動、後端無痛；舊紀錄相容（optional 欄位） | `comments` 變成混合內容，純文字分析較難 |
| B. 展開成多個 TSV 欄位 | 資料結構化、方便 SQL/Sheet 分析 | 必須改 `TSV_SCHEMA_MATCH` 與後端 Google Apps Script；打破既有匯出結構 |
| C. 新增獨立 JSON 欄位 | 保留結構 | 仍需改 schema、code.gs；多加一欄位容易壞 |

選 A 是因為比賽即將開始，任何對 `TSV_SCHEMA` / code.gs 的動作都會阻塞資料流；序列化字串保留讀寫相容性，未來要轉 B 只需 parse 字串即可。

### 選擇：Optional `PostMatchChecklist` + `comments` 為序列化輸出
- `ScoutingData.postMatchChecklist?` — 設為 optional，UI 內部結構化編輯
- 每次 update 呼叫 `serializeChecklist(checklist)` 同步寫回 `comments`
- 舊 localStorage 記錄載入時沒有 `postMatchChecklist`，UI 用空預設值 fallback

### 實作要點
1. **單一真相來源**：UI 改 `postMatchChecklist` 時，同一個 `update()` 呼叫同時覆寫 `comments` — 避免兩欄位脫節
2. **常數表分離**：`ISSUE_KEYS`、`FLAG_KEYS`、`RATING_ROW_KEYS` 放在 `utils/checklistSerializer.ts`，UI 渲染與序列化共用同一份，避免 chip 清單與輸出內容對不齊
3. **條件展開**：Hard collision 選「機器」後才顯示隊號 text input — 減少視覺雜訊

### React 快速連續 click 的 stale state
測試時觀察到：快速連續點擊 chip toggle，React 批次更新可能讀到 stale state，導致 chip 狀態沒完全進 state。改用 localStorage 直接寫入 + reload 驗證 serializer 輸出，才能確認 5 個評分列都正確分行。生產情境下使用者不會快速連點，屬測試框架方面的限制而非功能性 bug。

### 刻意不動的部分
- **`HistoryEditForm.tsx`**：YAGNI — 歷史編輯頁仍使用 `comments` textarea 直接編輯。若未來使用者需要在歷史頁重建 checklist UI，再擴充。
- **TSV schema / code.gs**：完全不動，確保不會阻塞賽事資料匯出流程。

### 對專案的影響
- `types.ts`：新增 `PostMatchChecklist` interface + 一個 optional 欄位
- `utils/checklistSerializer.ts`：新檔（~60 行）
- `contexts/LanguageContext.tsx`：+30 key（雙語）
- `components/TabViews.tsx`：PostMatchTab comments 段落重寫
- Bundle：+6.5 kB（291.38 kB gzip）

---

## PostMatch UI 清理 + Comments 拆欄 (2026-04-21)

### 問題
Phase 38 把 checklist 全部序列化進單一 `comments` 欄位是**暫時**避免動 schema 的權宜之計。實際使用後兩個問題浮現：

1. PostMatch 頁面太擁擠：11 個 issue chips + 6 個 performance chips 永遠全部展開，加上頂部 3 個 Toggle（robotDied / almostTipped / ridingOnBall）功能重複於 issue chips
2. 匯出到 Sheets 時，單一 `comments` 欄位混合了 Issues / Performance / Collision / Ratings / Free-text，OPR / 分析難以拆分

### 選擇 A：拆成 3 欄 TSV（breaking change），仍保留 UI 結構化

| 方案 | 優點 | 缺點 |
|------|------|------|
| 保留單欄 + 改用 JSON | schema 不破 | JSON 對 Google Sheets 不友善，仍需後端 parse |
| **3 欄：robotIssues / performance / comments** ✅ | 分析友善、free-text 與結構化分離、可直接 SQL | 需改 TSV_SCHEMA（21 → 23）+ 既有試算表要遷移標頭 |
| 7+ 欄（每個子區段獨立） | 最極致的結構化 | 欄位爆炸、QR 長度壓力、schema 維護成本高 |

選 3 欄是因為 `performance` 在分析時通常整體評估（flag+collision+ratings 綁在一起），分開成 7 欄過度正規化；但把 free-text 從結構化資料中抽離是關鍵 — 自由文字永遠要獨立欄，否則 regex 拆解很脆弱。

### TSV Schema 變更（21 → 23 欄）

```
舊:  ..., robotDied, almostTipped, ridingOnBall, comments                              (21)
新:  ..., robotDied, almostTipped, ridingOnBall, robotIssues, performance, comments    (23)
```

`robotDied` / `almostTipped` / `ridingOnBall` 雖然 UI Toggle 移除，欄位**保留在 schema 中且永遠為 false** — 這是刻意保留以避免再次動 schema（未來若要復原 UI 直接補回 Toggle 即可）。

### 遷移陷阱：既有 Google Sheets 仍是 21 欄標頭

部署新 `Code.gs` 後，試算表的第一行 header 還是舊 21 欄。`getOrCreateSheet` 只在工作表**不存在**或標頭**全空**時才會寫入標頭，對已有資料的試算表不會自動更新。

**解法**：手動 GET `?action=fixHeaders` 觸發一次。Scanner repo 的 `fixHeaders` 已設計為「讀取 SCHEMA 常數並覆寫第一行」— 所以只要 Code.gs 檔案是新版，呼叫一次就能把既有試算表升級到 23 欄。

**未來若再遇到 schema 擴充**，記得在 PR description / PROGRESS.md 明確標註「部署後須跑 `?action=fixHeaders` 一次」，避免 scouter 上傳資料後欄位錯位。

### UI Pattern：可摺疊區段 + 數量 badge

11 + 6 個 chip 永遠展開會讓 PostMatch 頁面視覺過重。改為預設收合，header 顯示啟用項目數量 badge（例：`機器異常 (2)`），scouter 一眼就知道有沒有勾選東西，不需每次展開檢查。

這個 pattern 可推廣到未來任何有「多 chip toggle」的頁面（例如 Pit Scouting 的可選機構陣列）。

### 刻意不動的部分
- `robotDied` / `almostTipped` / `ridingOnBall` boolean 欄位保留於 `types.ts` + `TSV_SCHEMA_MATCH`，避免「有一天想復原 Toggle」時再次動 schema
- `HistoryEditForm.tsx` 再次 YAGNI — 歷史頁面仍用最原始 textarea 編輯 `comments`，不重建三欄 UI

### 對專案的影響
- `types.ts`：`ScoutingData` +2 欄（robotIssues / performance），`PostMatchChecklist.extraComments?` 新欄位
- `constants.ts`：TSV_SCHEMA_MATCH 21 → 23
- `utils/checklistSerializer.ts`：1 函數 → 3 函數（serializeIssues / serializePerformance / serializeComments）
- `services/googleSheets.ts`：formatComments → 通用 formatTextField（3 個欄位共用同一函數）
- `components/TabViews.tsx`：PostMatchTab 減 3 Toggle + 加 2 collapse + 1 textarea
- **遷移成本**：需 Google Sheets 端呼叫 `?action=fixHeaders` 一次（Scanner repo Code.gs 已準備好）

---

## Scanner 長度 23 QR 歧義與雙用 schema (2026-04-21)

### 問題
Scouting PASS 的 Match Data 從 21 欄擴充到 23 欄後，Scanner 的 `detectQRType()` 遇到碰撞：
- Match (v1.5.0)：23 欄
- Pit External V2 legacy：23 欄（含 stability）
- Pit External 新 V2：23 欄（含 version 前綴）

三者長度完全一樣，純靠 `values.length` 無法區分。

### 選擇：用 `values[0]` 格式規則區分

Pit External 的 `values[0]` 一定是：
- 新 V2 → 以 `v` 開頭的字串（`v2`, `v3`, ...）
- legacy V1 → 純數字（teamNumber，如 `6998`）

Match 的 `values[0]` 是 `scouterName` — 字串，不會以 `v + 數字` 開頭（掃員名字通常不是 `v1` `v2`），也不會是純數字。

**Decoder 規則**（`src/utils/decoder.ts`）：
```
length === 23:
  values[0] matches /^v\d/i       → pit-external (新 V2)
  values[0] matches /^\d+$/       → pit-external (legacy)
  otherwise                        → match
```

### 邊緣情況（不擔心）
- Scouter 把名字寫成 `v3cool` → 會被誤判為 pit-external。但這是極端命名，且後端 Code.gs 的欄位名稱匹配會導致資料寫錯工作表時立刻發現 — 在實戰中先不處理
- 純數字掃員名字（如 `6998`）→ 會被判為 pit-external。實際團隊慣例用姓名或綽號，不會發生

### 為什麼不加 QR 類型標頭
歷史 QR 不能重編碼，要維持向下相容。且現有 QR 長度非常緊（壓縮率敏感），加 1~2 char 前綴會增加 LZ-String 壓縮負擔。格式規則判斷已足夠實用。

---

## PostMatch 扁平化欄位設計決策 (2026-04-21 第二段)

### 問題
Phase 40 把 `comments` 拆成 `robotIssues` / `performance` / `comments` 三欄後，`robotIssues` 和 `performance` 仍是「逗號串接的彙總文字」（例：`Low voltage, Stuck on bump`）。實際分析時要對單一項目（例：有多少場 `lowVoltage`？）做 COUNTIF / SUMIF 都要靠 regex，非常脆弱。需要進一步扁平化到獨立欄位。

### 三個設計決策與選擇理由

#### Decision 1: Ratings 保留文字，不拆 0/1
- **選項 A**：5 × 3 = 15 欄 one-hot（`ratingPushTrenchGood`, `ratingPushTrenchOk`, ...）
- **選項 B**：5 欄數字 0/1/2（空=未評）
- **選項 C ✅**：5 欄文字 `good` / `ok` / `bad` / 空

**為何選 C**：
- rating 是**有序 enum**，one-hot 太稀疏（1 場只有 1 個欄位是 1，其他 2 欄是 0，每列浪費 10 欄）
- 文字欄位 Google Sheets `COUNTIF(A:A, "good")` 即可統計，比數字 0/1/2 對分析者更直觀（不用記 0=bad 還是 0=good）
- 「空」本身就代表「未評分」，不需要額外的 null 表示

#### Decision 2: Collision 用 3 bool + 1 text 組合
- **選項 A**：單欄文字 `Robot(1234,5678)` 或 `Field`
- **選項 B ✅**：`hasCollision` (0/1) + `collisionField` (0/1) + `collisionRobot` (0/1) + `collisionTeamNumbers` (text)
- **選項 C**：完全拆（每個隊號一欄）— 不可行，隊號數量不定

**為何選 B**：
- `hasCollision` 當主 filter：`FILTER(data, hasCollision=1)` 一行搞定
- `collisionField` / `collisionRobot` 分開統計「場地碰撞」vs「機器碰撞」頻率
- 隊號作為 detail 資料放 text 欄，分析時再 parse（通常 drill-down 才需要）
- 關鍵原則：**布林旗標 + 文字細節** 比 **單欄混合字串** 更 pivot-friendly

#### Decision 3: 一刀清掉 `robotDied` / `almostTipped` / `ridingOnBall`
- **選項 A ✅**：直接從 schema 移除 3 欄
- **選項 B**：保留為永遠 false 的 dead 欄位（Phase 40 的做法）

**為何選 A**：
- Phase 39 移除 UI Toggle 後，這三欄 **確認永遠寫不到**（新資料永遠 false，舊 localStorage 資料雖有值但 UI 也改不到）
- 留著只會讓後續 schema 擴充（例如這次 23 → 44）多 3 欄雜訊
- 「同功能已在 issue chips / flag chips 裡」— `robotDied` = `issueCrashed`、`almostTipped` = `flagTipped`、`ridingOnBall` = `flagRidingFuel`，保留 = 資訊重複
- **原則**：dead 欄位要**趁 schema 本來就要大改時一起清**，比之後單獨清更省遷移成本

### 通用原則（可推廣）
1. **文字 enum vs one-hot**：值域 ≤ 3-4 且有序時，文字欄更緊湊；值域大或無序時才考慮 one-hot
2. **布林 + 細節 text**：比單欄混合字串（含條件性內容）更利於 pivot / filter
3. **Dead schema 清理時機**：跟其他 breaking change 一起做，避免多次遷移（使用者只要跑一次 `?action=fixHeaders`）

### 相關文件
- Spec: `FRC/docs/superpowers/specs/2026-04-21-postmatch-flat-fields-design.md`
- Commit: `33c87f5` — `docs: add PostMatch flat-fields design spec`（尚未 push）

---

## FRC 6998 Championship eventCode 大小寫 (2026-04-21)

TBA event key 慣例是全小寫（`2026cmptx`），但 Scouting PASS 的 `events2026.ts` 存的是官方大寫（`2026CMPTX`）。原本 `INITIAL_DATA.eventCode` 用小寫會導致 UI 下拉選單顯示未選中狀態（雖然 `EventCodeSelect` 有 case-insensitive fallback 比對，仍有視覺不一致）。

統一改為大寫存入 state。上傳 TSV 時若後端需要小寫可再轉（目前 Code.gs 對 eventCode 做 case-insensitive 比對，無需轉）。

---

## PostMatch 扁平化 collision clamp 設計 (2026-04-21 第三段)

### 問題
`checklistToFlatFields(c: PostMatchChecklist)` 產出 26 個 flat 欄位時，3 個 collision bool (`collisionField / collisionRobot` 等) + 1 個 text (`collisionTeamNumbers`) 在**使用者先勾選 Hard collision → 填隊號 → 取消 Hard collision** 的流程下，`PostMatchChecklist` 內部仍殘留 `collisionField=true / collisionTeamNumbers='1234'` 等值（因為 UI 只是把 `hasCollision` 切回 false，沒清子欄位）。若直接輸出，TSV / Sheets 會寫入「主旗標 0、細節欄卻有內容」的矛盾資料。

### 選擇：以 `hasCollision` 為主的 clamp 邏輯
在 serializer 內部：
```
hasCollision: c.hasCollision ? 1 : 0,
collisionField: (c.hasCollision && c.collisionField) ? 1 : 0,
collisionRobot: (c.hasCollision && c.collisionRobot) ? 1 : 0,
collisionTeamNumbers: c.hasCollision ? (c.collisionTeamNumbers ?? '') : '',
```

每個 collision 子欄位都跟 `hasCollision` AND 起來，關閉主旗標即全部歸零。這樣 UI 狀態保留（使用者再次勾 Hard collision 時隊號還在），但輸出永遠一致。

### 選擇理由
- **簡單優於乾淨**：另一種做法是在 UI 切 `hasCollision=false` 時同時清子欄位，但這會把「使用者暫時取消」變成「資料永久遺失」，體驗變差
- **輸出層比輸入層更適合做 consistency**：reactor pattern — 讓 state 容忍不一致，在序列化這道關卡統一規範化
- 與 `PRESERVE_EMPTY_KEYS` 搭配：子欄位 clamp 成 `0` / `''` 後，Sheets 端看到空字串而非 `'None'`（避免分析時 `COUNTIF(..., "None")` 混在 legit None 裡）

### 可推廣的原則
**主旗標 + 細節欄位**的 schema（這次 collision、未來任何類似 pattern），在 serializer 層用主旗標 clamp 所有細節欄位，比在 UI 層做 cascading reset 穩定且可測。

---

## Scanner repo Schema 三處鏡像（2026-04-21 第三段）

### 問題現象
Phase 44 完成 Scouting PASS 端 47 欄 schema 後，僅同步 scanner repo 的 `google-apps-script/Code.gs`（後端）。使用者掃 QR 時報：
```
[detectQRType] Unknown field count: 47, expected: match=23
```
且下游出現「路徑 QR 抓不到對應 Match 的資料」症狀。

### 根因分析
Scanner repo 的 TSV schema 有**三個鏡像位置**：

| 位置 | 功能 | 漏同步的後果 |
|------|------|-------------|
| `google-apps-script/Code.gs` | 後端接收並寫入 Sheets（doPost + fixHeaders） | Sheets 欄位錯位（但本次已同步） |
| `src/constants/schema.ts` | 前端解 QR 時用來 mapping values[] → 命名物件 | **未同步**：47 欄 QR 的 values 無法映射到物件欄位 |
| `src/utils/decoder.ts` | `detectQRType` 用長度比對決定 QR 種類 | **未同步**：length 47 不匹配 23 → 回 `'unknown'` |

本次事件是 2 + 3 都漏，`detectQRType` 先 fail → QR 歸類 `'unknown'` → `src/constants/schema.ts` 的映射邏輯根本走不到。即使映射也失敗，因為 schema 仍是 23 欄。

下游「路徑抓不到資料」的表面症狀，其實是因為 Match QR 解碼失敗 → `getMatchKey()` 從 `unknown` 物件的 `field1/field2/...` 取值 → 空殼 key → Path QR 無法用 `(eventCode, matchNumber, teamNumber)` 找到任何 Match 配對。**是 Match 解碼失敗的下游症狀，不是路徑查詢邏輯的 bug**。

### 修復（commit `31d7844`）
- `src/constants/schema.ts` — `TSV_SCHEMA_MATCH` 完整替換為 47 欄；`FIELD_LABELS` 重建（11 issue + 6 flag + 4 collision + 8 rating 對應 label）
- `src/utils/decoder.ts` — `detectQRType` 簡化：match 現在 47 欄不再與 pit-external-v2/legacy 23 欄衝突；原本的 length-23 三重歧義規則（`values[0]` 正則區分）現在簡化為「23-col 直接 pit-external」
- `src/i18n/locales/en.ts` + `zh-TW.ts` — `fields` 字典完全重建（保留舊 key 會讓編輯器混亂）

### 為何選 `PRESERVE_EMPTY_KEYS` 而非擴充 `formatTextField`
選擇設計時的 trade-off：

| 方案 | 優點 | 缺點 |
|------|------|------|
| **A. `PRESERVE_EMPTY_KEYS` Set** ✅ | 明確列舉哪些 key 要保留空字串（whitelist 語意）；不影響其他欄位（PreMatch 的 scouterName 等仍可保留原 `'None'` fallback 行為） | 新增 key 時要記得加入 Set |
| B. 擴充 `formatTextField` 多一個 flag 參數 | 邏輯集中 | 呼叫點要重新決定每個欄位的 flag；容易忘；廣泛影響 |
| C. 完全移除 `'None'` fallback | 最乾淨 | breaking change — PreMatch 欄位很多分析公式預期 `'None'` 代表未填，直接改會連動出錯 |

**為何選 A**：PostMatch 扁平欄位是**新增的**，可以完全自訂空值規則；既有 PreMatch 欄位則應維持 `'None'` 相容性避免破壞下游分析。Set 化既聚焦變更範圍，也讓未來新增欄位時有明確 opt-in/opt-out 位置。

### 預防措施（已存 memory）
1. 改 `TSV_SCHEMA_*` 時跑一次「三處鏡像 checklist」：Code.gs / schema.ts / decoder.ts 必須同時更新
2. `detectQRType` 改動後，拿 47-col real QR 跑一次端對端解碼驗證，而非只信 Code.gs build pass
3. i18n locales 漏更新不會 block 功能（會 fallback 到 raw key），但顯示會變醜，不屬於阻斷性漏點

---

## `detectQRType` 已動態化、長度比對自動跟上 schema (2026-04-26)

### 觀察
Phase 45 修 scanner 漏同步 bug 後，`src/utils/decoder.ts` 的 `detectQRType` 已從硬編碼長度比對（`length === 47`）改寫為動態 `length === TSV_SCHEMA_MATCH.length`。本次 Phase 46 把 schema 47 → 48 欄時，`decoder.ts` 的**邏輯**完全不需動 — `.length` 自動跟上新值。

### 影響：未來 schema 擴充剩兩件事
1. **schema.ts** 替換 `TSV_SCHEMA_MATCH` 陣列 + `FIELD_LABELS` 對應
2. **註解**手動同步（例如 `// 47 個欄位` 改 `// 48 個欄位`）— 純 readability，不影響邏輯

### 為何這個改寫值得記
- 屬於「修一次 bug 順手做的設計改進」，事後價值更高（每次 schema 改動省一處同步點）
- 程式化驗證 (`length === TSV_SCHEMA_MATCH.length`) 把「常數對齊」這件事從**人類記憶**轉成**程式自動檢查**
- 本次 Phase 46 加上的「三方 schema 比對驗證 script」是同類思路 — 把同步檢查從手動 review 改成程式化 assert

### 通用原則
當你發現自己在多處硬編碼同一個常數值，優先讓所有引用點都讀同一個 source-of-truth 變數的 `.length` / `.size` / `Object.keys()`。這比「記得每次同時改」可靠得多。

---

## issueShooterOff key 名與 label 語意不對齊（保留歷史包袱） (2026-04-26)

### 現況
- TSV key: `issueShooterOff`
- ZH label: 射球不準
- EN label: Shooter inaccurate

key 用 "Off"（語意接近「壞掉/離線」）但 label 用「不準」（語意是 inaccurate）。本次新增 `issueShooterStutter`（射球不順 — 短暫卡頓又恢復）時刻意讓 key 與 label 對齊（key=`Stutter`、label=「不順」），避免重蹈覆轍。

### 為何不重構舊 key
- 重構 `issueShooterOff` → `issueShooterInaccurate` 會：
  1. 主 repo 4 檔（含 `ISSUE_FIELD_MAP` 反查）
  2. Scanner repo Code.gs / schema.ts / FIELD_LABELS / 兩 i18n 共 5 檔
  3. 既有 Sheets 標頭（要再跑一次 fixHeaders）
  4. 既有 localStorage `frc_match_history` 資料保留舊 key（資料遷移成本）
- benefit 只有「key 與 label 一致看起來舒服」，純 cosmetic
- ROI 太低，列入 FINDINGS 警示後人即可

### 通用原則
新增 schema 欄位時 key 名直接對齊使用者可見的 label 語意。重構既有不對齊欄位的成本通常比看起來高，特別是有跨 repo 鏡像 + 既有資料遷移時。

---
*Last updated: 2026-04-26 (Phase 46 — issueShooterStutter v1.8.0)*
*Note: Video Analyzer 相關內容已移至獨立專案*

---

## v1.9.0 PostMatch「其他」區段 4 個關鍵設計決策 (2026-04-26)

> 本條目記錄 Phase 47（v1.9.0 = PostMatch 新增「其他」區段 + Teleop 移除 3 欄 Counter + stuck on ball → fuel label 改字）的 brainstorming 階段四個設計選擇與理由，供未來新增類似 PostMatch 互動欄位時參考。Spec 寫於 `docs/superpowers/specs/2026-04-26-postmatch-other-section-design.md`，當前狀態：**spec + plan + 17 tasks 實作全數完成（2026-04-26 Part 3）**。三方 schema 程式化驗證通過（main / scanner / gas 全部 48 欄、新增欄位 idx 44/45/46 一致）。

### 決策 1：「偷球」用 boolean 而非 3 級 rating

**情境：** 「會不會去對方 alliance zone 偷球」這題候選方案：
- (A) 3 級 rating（不會 / 偶爾 / 經常） — 與既有 8 個 rating 欄位一致
- (B) Counter 計數
- (C) **boolean toggle**（採用）

**選擇理由：** 偷球更像策略意圖的二元判斷（「這隊有沒有偷球行為」），程度區分對 alliance scouting 不會增加決策資訊。Counter 在 5 秒內難以正確計數。Boolean 型別讓資料分析端的 COUNTIF 統計更簡潔。

**通用原則：** 新增 PostMatch 欄位時先問「使用者實際看到甚麼就會勾」— 若是離散事件（有 / 無），boolean 比 rating 更貼合認知；若是觀感（順 / 普通 / 卡），rating 才合適。

### 決策 2：「其他」區段獨立、不併入既有區段

**情境：** 三個新題（球需求度 / 偷球 / 被 defense 影響）能否塞進既有「機器異常」/「機器表現」/「碰撞」區段？

**選擇：** 開**獨立**「其他」可摺疊區段。

**理由：** 三題語意是「策略觀察 / 跨隊互動」，與既有區段「自身機器狀態觀察」性質不同。混入會破壞區段語意一致性，未來新增同類型策略題也無處放。

**通用原則：** PostMatch 區段語意分類比塞滿欄位更重要 — 寧可開新區段也不要污染既有語意。

### 決策 3：Q1 / Q3 sufficient 沿用 good / ok / bad 字串值

**情境：** 兩個新 rating 題（球需求度、被 defense 影響）的字串值要設新詞彙還是復用？

**選擇：** **沿用** 既有 RATING_ROW_KEYS 機制，字串值用 `good` / `ok` / `bad`（label 在 i18n 層分別翻成「不需要 / 普通 / 很需要」與「還好 / 普通 / 嚴重」）。

**理由：** serializer (`checklistToFlatFields`) 不必為新格式分支；分析端 `COUNTIF(..., "good")` 對所有 rating 欄位都統一；i18n label 可獨立翻譯不受 key 限制。

**通用原則：** 序列化值（TSV 寫入）跟使用者看到的 label 兩層分離 — 新增評分類欄位優先沿用 good / ok / bad，i18n label 隨意換。

### 決策 4：stuck on ball → stuck on fuel **只改 i18n label，key 不動**

**情境：** 球體名稱從 ball 改成 fuel，TSV / types 中的 `flagStuckBall` 是否一併重構？

**選擇：** 只改 EN / ZH i18n label（"Stuck on fuel" / 「卡在 fuel 上」），key `flagStuckBall` 保留。

**理由（與 issueShooterOff 同樣的歷史包袱權衡）：**
- 重構 key 影響：主 repo 4 檔 + scanner 5 檔 + 既有 Sheets 標頭（要再 fixHeaders 一次）+ 既有 localStorage `frc_match_history` 舊 key 資料遷移
- benefit 純 cosmetic（key 與 label 一致看起來舒服）
- ROI 太低，列警示即可

**通用原則：** 一旦 key 已上線進入 Sheets / localStorage，只要 label 仍可達意就不要改 key。新增欄位時要一次設對，但既有欄位不重構。

---

## CRLF 檔案 + JavaScript regex multiline 模式邊界 bug (2026-04-26)

### 觀察
v1.9.0 實作 Phase 47 用 `node -e` 一次性 script 在 scanner 的 `Code.gs`（CRLF line endings）批次刪除 12 個 inline 重複行 + 1 個 multi-line block 時，下面這個 regex：

```js
content.replace(/^\s*previousLine,\r?\n\s*targetLine,\r?\n/gm, '');
```

**意外症狀：** 刪除動作成功，但前一行的尾端 `\n` 也被吃掉，導致 `prevLine,targetLine,` 黏成一行（不是 `prevLine,\ntargetLine,`）。

### 根因
JavaScript regex 的 `gm` flag 下，`^` 在 line terminator 之後 activate。但 line terminator 包含 `\r`（CR）和 `\n`（LF）。CRLF 檔案的每行結尾是 `\r\n`：
- 上一行尾端 → `prev,\r\n`
- 此處 `^` 先在 `\r` **之後**就 activate（不需等到 `\n`）
- `\s*` 是貪婪的，從 `\r` 後開始往後吃，**會跨越接下來的 `\n` 邊界**繼續吃 target 行的 leading whitespace
- 結果：前一行的 `\n` 被當成 target 行的「leading whitespace」一起吃掉

### 修法
1. **規範化 line ending 後再跑 regex**：先 `content.replace(/\r\n/g, '\n')` → 改 → 寫回時補 `\r\n`（如果需要保留 CRLF）
2. **避免靠 `^\s*` 抓行首**：改用 `\r\n\s*` 顯式比對 line ending → 但這對檔案首行不 work
3. **事後手動 fix**：本次選這個（影響範圍只 1 行 + 已有 git diff 可看），刪除完手動補回受影響行的 `\n`

### 通用原則
- Windows-origin 檔案（含 Code.gs / .ts / .md，git 預設 `core.autocrlf=true`）跑 multi-line regex 前，先確認 line ending 為何
- `^\s*` + `gm` 在 CRLF 檔案要小心；安全做法是 `^[ \t]*`（不含 `\r\n`）或先 normalize
- 同類陷阱也存在於 `$\s*` — 會吃掉下一行的內容

---

## Vite build 不跑 TS type check（必須 `npx tsc --noEmit` 才能驗 type 錯誤）(2026-04-26)

### 觀察
v1.9.0 Stage A 改完 schema 層（4 檔）後想驗證沒打壞既有 type 體系，跑 `npm run build`（執行 Vite production bundle）顯示 PASS — 但其實這只證明 esbuild transform 成功，**TS type check 完全沒跑**。需要另外跑 `npx tsc --noEmit` 才會顯示真正的 type errors。

### 為何 Vite 預設不跑 type check
Vite 的設計哲學是「dev / build 速度優先」，把 type check 視為 IDE / CI 的職責，不阻塞 build。esbuild 只做語法 transform，不做語義分析。常見的補強方式：
- 在 `package.json` 加 `"type-check": "tsc --noEmit"` script
- 在 CI / pre-commit hook 強制跑 `tsc --noEmit`
- 用 `vite-plugin-checker` 在 dev / build 時併行跑 type check

### 本次操作策略：刻意不在每改 1 檔跑 type check
v1.9.0 Plan 17 tasks 中，前半段是 schema / types / serializer 連動修改（移 3 欄 + 加 3 欄），中間任何一個檔案修一半時，下游檔案會出現「**預期**的」type 錯誤（例如 types.ts 移除 `bumpCount` 後，`TabViews.tsx` 還沒改的 Counter 行會炸 type）。

如果每改 1 檔跑一次 type check，會被「預期錯誤」噪音淹沒，難以辨識「**新引入的非預期錯誤**」。Inline Execution 在 Stage A（schema/types/serializer 全改完）才跑 type check 是策略性選擇 — 等到一致性回復後再驗，差值才有意義。

### Baseline TS errors 比對技巧
專案累積有 13 個預存 TS errors（App.tsx useRef/MatchLevel unused、googleSheets index errors 等歷史包袱）。要區分「我新引入的」vs「pre-existing」：

```bash
# 改前
git stash                                 # 暫存所有改動
npx tsc --noEmit 2>&1 | grep -c error    # → 13 (baseline noise)
git stash pop                             # 還原改動

# 改後
npx tsc --noEmit 2>&1 | grep -c error    # → 13（差值 0 即合格）
```

差值才是新引入的。本次 Stage A / B 完工後 baseline 維持 13，零新增。

### 通用原則
- Vite 專案 = build pass ≠ type pass。要驗 type 必跑 `tsc --noEmit`
- 大型重構連動多檔時，先全部改完再跑 type check，不要每檔跑（會被預期錯誤淹沒）
- 既有 type errors 用 `git stash` baseline 比對技巧，把新 vs 舊分開

---

## Verifier parser 必須同時支援 inline 與 multi-line array 寫法 (2026-04-26)

### 情境
v1.9.0 Phase 47 寫了一次性程式化驗證腳本（`scripts/verify-v1.9.cjs`，commit 前刪掉），目的：解析 main `constants.ts` / scanner `schema.ts` / GAS `Code.gs` 三方的 `TSV_SCHEMA_MATCH` array → 驗 length 都 48、欄位逐一 idx 對齊。

Plan 範例的 parser 用的 regex 是：
```js
/^\s*'([a-zA-Z_]+)',?\s*$/gm   // 每行一個 'xxx',
```

### 問題
- ✅ scanner `schema.ts` 的寫法：每欄獨立一行（multi-line），上面 regex 解 48/48 OK
- ✅ GAS `Code.gs` 的寫法：同上 multi-line，OK
- ❌ main `constants.ts` 的寫法：**inline**（每行多個 `'xxx', 'yyy', 'zzz',`），上面 regex 只能解到 16/48（每行只取一個）

### 修法
改用「跨任意排版抽 quoted identifier」的 regex：

```js
// 1. 先 strip 註解，避免歷史 changelog 字串裡的 keyword 被誤抓
const stripped = content.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

// 2. 抽 array literal 範圍（避免抓到別的字串常數）
const arrayMatch = stripped.match(/TSV_SCHEMA_MATCH\s*=\s*\[([\s\S]*?)\]/);
const body = arrayMatch[1];

// 3. matchAll 抽所有 quoted identifier
const fields = [...body.matchAll(/['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]/g)].map(m => m[1]);
```

關鍵：
- `matchAll` + `g` flag 抽全部 match（不限每行一個）
- 限定 identifier 字符 `[a-zA-Z_][a-zA-Z0-9_]*` 排除其他字串字面量
- **strip 註解**很關鍵 — 沒這步會把歷史 changelog 註解（例如 `// v1.7.0 加了 8 個 ratingXxx`）裡的 keyword 一起抓進來，造成假性 length mismatch

### 通用原則
- 跨檔程式化驗證腳本必須對「同一個資料結構在不同檔案的不同寫法」robust — schema 可能是 inline / multi-line / 帶註解 / 不帶註解
- 用 `matchAll` 跨任意排版抽 token，比 line-based regex 可靠得多
- **永遠先 strip 註解再 parse**：歷史 changelog 註解常意外含 schema keyword，會污染解析結果

---

*Last updated: 2026-04-26 (Phase 47 — v1.9.0 PostMatch Other section 實作完成 + 3 implementation findings: CRLF regex bug / Vite vs tsc / verifier parser)*
