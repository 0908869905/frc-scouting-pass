# Findings & Decisions

## Project Status

> **重要更新 (2026-01-23):** FRC Video Analyzer 已分離為獨立專案
> - 新位置: `D:\frc-video-analyzer`
> - GitHub: https://github.com/0908869905/frc-video-analyzer

本專案 (Scouting PASS) 現為純人工 scouting 應用。

---

## Requirements (Scouting PASS)

- FRC 6998 比賽 scouting 應用 (2026 Reefscape)
- 支援 PreMatch → Auton → Teleop → PostMatch 流程
- QR Code 生成 + TSV 匯出
- Google Sheets 自動上傳
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
*Last updated: 2026-01-24*
*Note: Video Analyzer 相關內容已移至獨立專案*
