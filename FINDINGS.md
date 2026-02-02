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
*Last updated: 2026-02-01*
*Note: Video Analyzer 相關內容已移至獨立專案*
