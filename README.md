# FRC 6998 Scouting PASS — 離線優先的偵察記錄 App

> 偵察資料鏈的前半段：隊友在看台上用它記錄每場比賽每台機器人的表現——**離線可用、多語介面、手繪路徑畫布**——資料壓縮成 QR Code，交給 [Scout Scanner](https://github.com/0908869905/frc-scout-scanner) 解碼彙整。2026 賽季（Magnolia 區域賽、世界賽）實戰使用。

| | |
|---|---|
| 作者 | 李昌侑（Rick Lee）— FRC 6998 UNIPARDS 程式組 |
| 期間 | 2025/12 – 2026/04（120+ commits） |
| 狀態 | **上線**（Web App：frc-ten.vercel.app；Capacitor iOS） |
| 規模 | 約 4,500 行 |

## 為什麼做這個

比賽場館的網路不可靠、看台上的隊友沒時間打字。這支 App 的設計前提就是「沒網路也要能用、記完就能交出去」：所有資料留在裝置上，用 QR 當傳輸媒介，掃描端再彙整。

## 做了什麼

- **離線優先**：PWA＋本機儲存，整場比賽不需要任何連線
- **結構化記錄**：自動期／手動期／終局的得分動作、失誤、防守，TSV schema 48 欄，與掃描端鏡像同步管理（改一欄兩邊一起改）
- **路徑手繪畫布**：在場地圖上畫機器人的自動期路徑，轉成資料一起帶走
- **壓縮 QR**：`lz-string` 壓縮後以 QR 輸出，一張 QR 裝下一整場
- **多語介面**：中英切換，讓不同隊員都能上手
- **iOS 版**：Capacitor 打包、觸覺回饋、啟動畫面

## 架構

```
React 18 + TypeScript + Vite ── Tailwind CSS
 ├─ services/storage ── 本機資料層（離線）
 ├─ 路徑畫布 ── Canvas 手繪 → 座標序列
 ├─ lz-string ── 壓縮 → react-qr-code 輸出
 └─ Capacitor ── iOS 殼（haptics / splash / status bar）
```

## 一段歷史

這個 repo 最早不是偵察 App：它的前身是一個 SAM＋ByteTrack 的比賽影片分析原型——也就是後來全國科展作品「[這球誰射的？](https://github.com/0908869905/scoring-analyzer)」的最初起點。commit 歷史保留了這段轉折。

## 本機執行

```bash
npm install && npm run dev
```

## 開發方式（AI 協作聲明）

本專案以「與 AI 結對開發」完成：需求定義（來自看台上的真實使用）、資料格式與離線架構設計、實機驗證由我負責，程式碼由我與 AI（Claude Code）協作產出；每個模組做什麼、為什麼選這個方案、哪裡會失效，由我判斷並負責。`PROGRESS.md`／`FINDINGS.md`／`ERRORS.md` 為開發期間的真實工作紀錄。

## 相關專案

[Scout Scanner（掃描、彙整、OPR）](https://github.com/0908869905/frc-scout-scanner) ・ [科展・電腦視覺計分](https://github.com/0908869905/scoring-analyzer) ・ [影像標註平台](https://github.com/0908869905/frc-train-review) ・ [報帳系統](https://github.com/0908869905/frc-expense-money) ・ [台灣手語影音辭典](https://github.com/0908869905/tsl-sign-dictionary) ・ [園遊會點餐系統](https://github.com/0908869905/ordering-system)
