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
*Last updated: 2026-02-04*
*Note: Video Analyzer 相關內容已移至獨立專案*
