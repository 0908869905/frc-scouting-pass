# FieldCanvas 路徑圖 180° 翻轉功能 — 設計文件

**日期**：2026-04-28
**狀態**：Design approved, awaiting implementation plan
**範圍**：純 UI / 前端視覺功能；不涉及 schema、TSV、QR、scanner repo

---

## 動機

Scout 練習時會看各區域賽影片對照畫線。但有些影片是從**對面看台**錄的（紅藍方向相反、視角上下顛倒）。目前 FieldCanvas 只能用「固定視角」畫路徑，使用者要在腦中翻轉影片內容對應到場地圖，容易出錯。

加一個翻轉按鈕，讓使用者能視覺翻轉路徑圖以對應影片視角，但**儲存與輸出的座標永遠是原始視角**（不污染資料）。

---

## 範圍與不變條件

**會動**：
- `App.tsx`（加 `isFlipped` state + 傳給 AutonTab；`handleReset()` **不**動）
- `components/TabViews.tsx`（AutonTab 加 prop、轉傳給 FieldCanvas）
- `components/FieldCanvas.tsx`（接 prop + DOM 重構 + Flip 按鈕）
- `contexts/LanguageContext.tsx`（+1 個 i18n key）

**不會動（明確排除）**：
- `App.tsx` 的 `handleReset()`（第 155-167 行）— `isFlipped` 不在 reset 範圍，整個 session 內保留
- `types.ts` `PathPoint` interface — 座標儲存格式不變
- `types.ts` `ScoutingData` — 翻轉狀態不入庫（不持久化、不該存）
- `constants.ts` `STARTING_ZONE_*` — 起始區域定義不變
- 所有 schema、TSV、QR 編碼/解碼邏輯
- Scanner repo（`google-apps-script/Code.gs` / `src/constants/schema.ts` / `src/utils/decoder.ts`）
- `services/storage.ts`、`services/googleSheets.ts`、`utils/checklistSerializer.ts`

**核心不變條件**：
> `path: PathPoint[]` 永遠儲存「未翻轉」的原始百分比座標。翻轉只是視覺層的呈現變換。

---

## 1. 架構

State 提升到 `App.tsx`（最頂層），不在 FieldCanvas 內部：

```typescript
// App.tsx
const [isFlipped, setIsFlipped] = useState(false);
// ...
{currentPhase === 'Auton' && <AutonTab data={data} update={updateData} handedness={handedness}
                                       isFlipped={isFlipped} onFlipChange={setIsFlipped} />}
```

Prop drilling 鏈：`App.tsx` → `AutonTab` → `FieldCanvas`（各往下傳一層）。

### 為什麼放 App.tsx 不放 FieldCanvas

如果放在 FieldCanvas 內部,因為 `App.tsx:287-291` 用 `{currentPhase === 'Auton' && <AutonTab />}` conditional render — 切到其他 phase 時 AutonTab 整個 unmount,FieldCanvas 跟著消失,翻轉狀態就丟了。把 state 提升到 App.tsx,即使 AutonTab 反覆 unmount/remount 也不影響 state 本身。

### State 生命週期（純 session-only）

- **整個 session 內維持**:Auton ↔ Teleop ↔ PostMatch ↔ ... 來回切換都不影響翻轉狀態
- **Reset Match 後也維持**:`handleReset()`(`App.tsx:155-167`)只 spread `INITIAL_DATA` 與 `setData`,沒動到 `isFlipped`,所以下一場新比賽進到 Auton 時翻轉狀態仍在
- **重新整理頁面才回 false**:state 隨 React app 重新初始化
- **不持久化**:不寫 localStorage、不入 ScoutingData
- **跨 fullscreen ↔ 行內 切換維持**:fullscreen 是 createPortal,本來就不 unmount

### 已知 trade-off(使用者已決定)

「session 內維持」代表使用者**有可能在練習完忘記關翻轉,在實戰新比賽還殘留**。Mitigation:Flip 按鈕啟用中用 cyan 高亮顯示,容易一眼看出當前狀態。

---

## 2. 資料流

```
使用者點擊 (vx, vy) ─┐
                     │  在 getPointFromEvent 內：
                     │    if isFlipped: storedPoint = (100 - vx, 100 - vy)
                     │    else:         storedPoint = (vx, vy)
                     ▼
              path[] 儲存「原始視角」座標
                     │
                     │  繪製時：
                     │    canvas 容器套 CSS transform: rotate(180deg)
                     │    繪製邏輯不動，使用 path 原始座標畫，視覺由 CSS 翻轉
                     ▼
              QR / TSV 匯出 / Share PNG ─→ 永遠原始座標 / 原始視角
```

**關鍵設計**：CSS `rotate(180deg)` 是純視覺旋轉，但 pointer event 的 `clientX/Y` 是 viewport 原始座標，且 `getBoundingClientRect()` 給出的 rect 大小不受旋轉影響（只是位置不變）。所以使用者「視覺上看到的位置」轉成百分比後是「翻轉後的座標」，需要反向變換 `100 - x` / `100 - y` 才能存回原始座標。

---

## 3. DOM 結構調整

### 改前
```jsx
<div containerRef>          // 唯一容器
  <img field />
  <div alliance label />    // top-left
  <button Maximize />       // top-right
  <canvas />
  <div hint text />         // 空狀態提示
  <div starting zone label />  // top-center
</div>
```

### 改後
```jsx
<div containerRef>                                          // 不翻
  <div className="absolute inset-0"
       style={isFlipped ? { transform: 'rotate(180deg)' } : undefined}>
    <img field />
    <canvas />
  </div>
  <div alliance label />                                    // 不翻、保持 top-left
  <button Flip />                                           // top-right（Maximize 左邊）
  <button Maximize />                                       // top-right
  <div hint text />                                         // 不翻、保持中央
  {!isFlipped && <div starting zone label />}               // 翻轉時隱藏
</div>
```

### 為什麼不需要 counter-rotate
標籤/按鈕從一開始就在外層、沒被翻轉，所以不需要再用 `rotate(180deg)` 轉回來。

### Fullscreen 視圖採同樣 DOM 模式
Fullscreen 的 portal 內也用同樣的「翻轉內層 + 外層 UI」結構，狀態共用 `isFlipped`。

---

## 4. 座標翻轉的數學

**唯一需要翻轉的地方**：`getPointFromEvent` 函數。

```typescript
const getPointFromEvent = useCallback((e: PointerEvent): PathPoint => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  let x = ((e.clientX - rect.left) / rect.width) * 100;
  let y = ((e.clientY - rect.top) / rect.height) * 100;
  if (isFlipped) {
    x = 100 - x;
    y = 100 - y;
  }
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}, [isFlipped]);
```

**繪製邏輯（`useEffect` 第 150-273 行）完全不動**：因為：
- 路徑點存的是原始座標
- 繪製時 `(p.x / 100) * canvasSize.width` 算出未翻轉位置
- 視覺翻轉由 CSS 套在容器上完成

**Starting zone 綠色背景的繪製也不動**：原本就用 `startingZoneOffset` 算位置，CSS transform 會自動讓綠色區域跟著翻到視覺上對應的「翻轉後紅方位置」。

---

## 5. UI / 互動

### Flip 按鈕

| 屬性 | 值 |
|------|---|
| Icon | `RotateCcw`（lucide-react，已在依賴中） |
| 未啟用樣式 | 跟 Maximize 同（`bg-slate-900/70 border border-slate-600 text-slate-300`） |
| 啟用中樣式 | cyan 高亮（`bg-brand-500/30 border-brand-500/50 text-brand-400`） |
| `aria-label` / tooltip | i18n key `flipField` |

### 行內視圖位置
右上角，Maximize 按鈕**左邊**：
```
                          [Flip] [Maximize]   ← top-right corner
[Field 圖 + Canvas]
                          (alliance label 在 top-left)
[Clear] [Undo] [Share]    ← bottom 控制區（不變）
```

### Fullscreen 視圖位置
左側 vertical bar，加在 Clear/Undo **之後**、Stopwatch 之前：
```
left bar (top → bottom):
  [Trash]
  [Undo]
  [Flip]                  ← 新增
  [Stopwatch display]
  [Stopwatch button]
```

---

## 6. 邊界情況

| 情況 | 處理 |
|------|------|
| Share PNG 匯出 | **永遠輸出原始視角**。`handleShare` 內 export canvas 不套 transform，跟 QR/TSV 座標一致 |
| `isStartInValidZone` 驗證 | **不動**。Path 永遠存原始座標，驗證自動正確 |
| 路徑警告 banner（行內視圖底部） | **不動**。永遠正向顯示 |
| Fullscreen ↔ 行內 切換 | 翻轉狀態維持（FieldCanvas 不 unmount） |
| 方向自動切換（landscape ↔ portrait） | 翻轉狀態維持（不依賴 fullscreen 狀態） |
| 切離 Auton phase 再切回來 | **翻轉狀態維持**（state 在 App.tsx，不受 FieldCanvas unmount 影響） |
| Reset Match 後重新進 Auton | **翻轉狀態維持**（`handleReset()` 不動 `isFlipped`） |
| 切換 alliance（在 PreMatch） | 翻轉狀態維持（與 alliance 無關） |
| 重新整理頁面 | 翻轉狀態消失（state 隨 React app 重新初始化） |
| Starting zone 綠色背景 | 跟 canvas 一起翻（自然行為，視覺對應正確） |
| Starting zone 文字標籤 | 翻轉時隱藏（避免文字倒著、且綠色區足夠識別） |
| Alliance 標籤（RED/BLUE） | 永遠顯示在 top-left、文字正向 |

---

## 7. i18n

`contexts/LanguageContext.tsx` 加 1 個 key：

| Key | English | 繁體中文 |
|-----|---------|----------|
| `flipField` | `Flip Field` | `翻轉場地` |

只用於按鈕的 `aria-label` 與 tooltip。按鈕本體只顯示 icon，不顯示文字。

---

## 8. 不做什麼（YAGNI）

- ❌ 不持久化翻轉狀態（不寫 localStorage）
- ❌ 不加「重置翻轉」按鈕（再按一次 Flip 即可切回，重新整理頁面也會歸零）
- ❌ **不在 reset match 時自動歸零翻轉狀態**（純 session-only，跨 match 維持，符合使用者明確要求）
- ❌ 不加視覺警告「你目前在翻轉狀態」（依靠按鈕本身的 cyan 高亮即可）
- ❌ 不加水平鏡像、垂直鏡像選項（只支援 180° 旋轉，YAGNI）
- ❌ 不調整 starting zone 文字標籤位置（翻轉時直接隱藏，避免複雜化）
- ❌ 不對外暴露翻轉狀態（不傳給父層、不存進 ScoutingData）
- ❌ 不寫單元測試（純 UI、影響面小、靠手動驗證項目）

---

## 9. 驗證項目（手動）

| # | 項目 | 期望 |
|---|------|------|
| 1 | 按 Flip 按鈕 | 場地圖、現有路徑、起始區域綠色背景**全部翻轉 180°** |
| 2 | 按鈕、alliance 標籤、警告 banner | **不翻**且文字正向 |
| 3 | Starting Zone 文字標籤 | 翻轉時消失，回正時恢復 |
| 4 | 翻轉狀態下畫新路徑 | 視覺位置正確（手指放哪線就在哪） |
| 5 | 切回正向視角 | 既有路徑視覺位置正確（資料不丟、不錯位） |
| 6 | 翻轉狀態下匯出 PNG（Share） | 輸出**正向視角**的圖（不翻） |
| 7 | 翻轉狀態下生成 QR | scanner 端解出來的座標跟「正向視角畫的路徑」相同 |
| 8 | Fullscreen ↔ 行內 切換 | 翻轉狀態維持 |
| 9 | 旋轉裝置（landscape ↔ portrait） | 翻轉狀態維持 |
| 10 | 切離 Auton 再切回 | **翻轉狀態維持**（state 在 App.tsx） |
| 11 | Reset Match 後再進 Auton | **翻轉狀態維持** |
| 12 | 重新整理頁面 | 翻轉狀態回到正向（消失） |
| 13 | Flip 按鈕啟用中 | cyan 高亮顯示 |
| 14 | `npm run build` | 通過、零 TypeScript errors |

---

## 10. 實作步驟概要（給 writing-plans 參考）

1. 在 `App.tsx` 加 `const [isFlipped, setIsFlipped] = useState(false)`
2. `App.tsx:288` 給 AutonTab 多傳兩個 prop（`isFlipped` + `onFlipChange`）
3. 在 `TabViews.tsx` 給 AutonTab 加新 props interface（extend TabProps）+ 轉傳給 FieldCanvas
4. `FieldCanvas.tsx`：加 `RotateCcw` 到 lucide-react import
5. `FieldCanvas.tsx`：FieldCanvasProps 介面加 `isFlipped` + `onFlipChange`
6. `FieldCanvas.tsx`：`getPointFromEvent` 加翻轉邏輯
7. `FieldCanvas.tsx`：DOM 重構（行內視圖）— 加翻轉內層 div、加 Flip 按鈕
8. `FieldCanvas.tsx`：DOM 重構（fullscreen portal）— 加翻轉內層 div、加 Flip 按鈕到 left bar
9. `FieldCanvas.tsx`：兩個視圖的 starting zone label 加 `{!isFlipped && ...}`
10. `LanguageContext.tsx`：加 i18n key `flipField` (en + zh-TW)
11. `npm run build` 驗證
12. 手動驗證 14 項

---

## 11. Risk 評估

| 風險 | 嚴重度 | Mitigation |
|------|-------|-----------|
| 翻轉時座標公式寫錯（漏 invert / invert 兩次） | 高 | 驗證項目 #4 #5 #7 涵蓋；單一函數修改、測試容易 |
| Fullscreen 跟行內視圖只改了一處、另一處漏改 | 中 | 兩處都列在實作步驟 4/5；驗證項目 #8 |
| Share PNG 不小心把翻轉視角輸出 | 中 | 驗證項目 #6；handleShare 程式碼不動就自動正確 |
| pointer event 在 transform 容器內行為異常 | 低 | 用 CSS transform 不影響 hit-testing；rect 仍正確 |
| Tailwind 沒套上 `transform` class（`rotate-180` 是 utility class，但這裡用 inline style 比較直接） | 低 | 用 `style={{ transform }}` 不依賴 utility class |
| Prop drilling 鏈中漏接（`App.tsx` → `AutonTab` → `FieldCanvas` 任一段忘記傳） | 中 | 實作步驟 1-3 都加到 plan；TypeScript interface 強制要求；驗證項目 #1 立即發現 |
| 使用者忘記關翻轉、實戰用了翻轉視角 | 中 | Flip 按鈕啟用中 cyan 高亮；YAGNI：不加額外警告（使用者已決定） |

---

## 12. Out-of-scope（明確不做）

- 不支援任意角度旋轉（90°、270°、自由角度）
- 不支援單軸鏡像（只有 180° 旋轉，因為使用者已選 A）
- 不在「正向 / 翻轉」之間動畫過渡（直接切換，YAGNI）
- 不在 PostMatch / 其他 phase 顯示 FieldCanvas（本來就只在 Auton phase 用）

---

*Last updated: 2026-04-28*
