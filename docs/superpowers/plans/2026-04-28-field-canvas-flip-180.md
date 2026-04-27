# FieldCanvas 路徑圖 180° 翻轉功能 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Auton phase 的 FieldCanvas 路徑圖加一顆 180° 翻轉按鈕，視覺翻轉場地與路徑以對應「對面看台」視角的影片，但儲存與輸出座標永遠是原始視角。

**Architecture:** State (`isFlipped: boolean`) 提升到 `App.tsx` 最頂層（避免 conditional render unmount 時遺失），透過 prop drilling 傳給 `AutonTab` → `FieldCanvas`。FieldCanvas 內：(a) 用 CSS `transform: rotate(180deg)` 翻轉內層 div（含背景圖 + canvas），(b) `getPointFromEvent` 加 `100 - x / 100 - y` 反向變換，使儲存的 `path[]` 永遠是原始座標。所有按鈕、標籤、計時器在外層保持正向不翻。

**Tech Stack:** React 18 + TypeScript 5.2 + Vite 5 + Tailwind CSS 4 + lucide-react（已有 `RotateCcw` icon）。沒有 test framework，驗證靠 `npm run build`（TypeScript 編譯）+ 手動操作測試。

**Spec:** [`../specs/2026-04-28-field-canvas-flip-180-design.md`](../specs/2026-04-28-field-canvas-flip-180-design.md)

---

## File Structure

| 檔案 | 修改範圍 | 責任 |
|------|---------|------|
| `contexts/LanguageContext.tsx` | +2 行（en + zh） | `flipField` i18n key |
| `App.tsx` | +1 useState + 修改 1 行 | 持有 `isFlipped` state、傳給 `AutonTab` |
| `components/TabViews.tsx` | 修改 2 處（interface + render） | AutonTab 接 props 並轉傳給 FieldCanvas |
| `components/FieldCanvas.tsx` | 加 props、新增 toggle、改 `getPointFromEvent`、DOM 重構 | 接收翻轉 state、視覺翻轉、Flip 按鈕、座標反向變換 |

無新檔案。

---

## Task 1: 加 `flipField` i18n key

**Goal:** 在 LanguageContext 加翻譯 key，後續按鈕的 `aria-label` / tooltip 會用到。

**Files:**
- Modify: `contexts/LanguageContext.tsx`

- [ ] **Step 1: 找到 en 區塊的 `drawPathHint`（line 26）下方加新 key**

Edit `contexts/LanguageContext.tsx` line 26 後加一行：

```typescript
    drawPathHint: "Draw robot path with finger",
    flipField: "Flip Field 180°",
    autoClimbStatus: "Climb Status",
```

- [ ] **Step 2: 找到 zh 區塊的 `drawPathHint`（line 228）下方加對應翻譯**

Edit `contexts/LanguageContext.tsx` line 228 後加一行：

```typescript
    drawPathHint: "用手指繪製機器人路徑",
    flipField: "翻轉場地 180°",
    autoClimbStatus: "攀爬狀態",
```

- [ ] **Step 3: Build 驗證**

Run: `cd D:/FRC/frc-6998-scouting-pass/FRC && npm run build`
Expected: TypeScript 編譯通過，零 errors。新 key 加入但沒人用，不該出 warning。

- [ ] **Step 4: Commit**

```bash
cd D:/FRC/frc-6998-scouting-pass/FRC
git add contexts/LanguageContext.tsx
git commit -m "feat(i18n): add flipField translation key for upcoming flip feature"
```

---

## Task 2: 拉 prop drilling 鏈（App.tsx → AutonTab → FieldCanvas）

**Goal:** 把 `isFlipped` state + setter 從 App.tsx 拉到 FieldCanvas。**這個 task 必須 4 個 step 一次完成才能 build 過**（中間任何一步都會有 TypeScript 編譯錯）。Top-down 改：App → AutonTab → FieldCanvas，最後 build 驗證。

**Files:**
- Modify: `App.tsx`（加 state、修改 line 288 的 AutonTab render）
- Modify: `components/TabViews.tsx`（加 AutonTabProps interface、AutonTab 接 + 轉傳）
- Modify: `components/FieldCanvas.tsx`（加 props 到 interface、destructure 收下、暫不使用）

- [ ] **Step 1: 在 App.tsx 加 `isFlipped` state**

Edit `App.tsx`，在現有 state 區附近加（建議放在 `lastSaveTime` state 之後，line 46 附近）：

找到：
```typescript
  // Auto-save indicator timestamp
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
```

改成：
```typescript
  // Auto-save indicator timestamp
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);

  // FieldCanvas 180° flip state (session-only, persists across phases & match resets)
  const [isFlipped, setIsFlipped] = useState(false);
```

- [ ] **Step 2: 在 App.tsx 第 288 行傳 prop 給 AutonTab**

Edit `App.tsx` line 288：

找到：
```typescript
        {currentPhase === 'Auton' && <AutonTab data={data} update={updateData} handedness={handedness} />}
```

改成：
```typescript
        {currentPhase === 'Auton' && <AutonTab data={data} update={updateData} handedness={handedness} isFlipped={isFlipped} onFlipChange={setIsFlipped} />}
```

- [ ] **Step 3: 在 TabViews.tsx 加 `AutonTabProps` interface**

Edit `components/TabViews.tsx`，找到 `interface TabProps`（line 30-34）區塊，**之後**加新 interface（不要動 TabProps，其他 tab 還在用）：

找到：
```typescript
interface TabProps {
  data: ScoutingData;
  update: (fields: Partial<ScoutingData>) => void;
  handedness?: Handedness;
}
```

改成：
```typescript
interface TabProps {
  data: ScoutingData;
  update: (fields: Partial<ScoutingData>) => void;
  handedness?: Handedness;
}

interface AutonTabProps extends TabProps {
  isFlipped: boolean;
  onFlipChange: (flipped: boolean) => void;
}
```

- [ ] **Step 4: 改 AutonTab signature 並轉傳給 FieldCanvas**

Edit `components/TabViews.tsx` line 475：

找到：
```typescript
export const AutonTab: FC<TabProps> = ({ data, update, handedness }) => {
```

改成：
```typescript
export const AutonTab: FC<AutonTabProps> = ({ data, update, handedness, isFlipped, onFlipChange }) => {
```

接著找到 FieldCanvas render（line 490-497）：

```typescript
      <FieldCanvas
        path={data.autoPath}
        onPathChange={(path) => update({ autoPath: path })}
        alliance={alliance}
        climbTime={data.autoClimbTime}
        onClimbTimeChange={(val) => update({ autoClimbTime: val })}
        climbLabel={t('autoClimbTime')}
      />
```

改成：
```typescript
      <FieldCanvas
        path={data.autoPath}
        onPathChange={(path) => update({ autoPath: path })}
        alliance={alliance}
        climbTime={data.autoClimbTime}
        onClimbTimeChange={(val) => update({ autoClimbTime: val })}
        climbLabel={t('autoClimbTime')}
        isFlipped={isFlipped}
        onFlipChange={onFlipChange}
      />
```

- [ ] **Step 5: 改 FieldCanvas props interface（接收 props 但暫不使用）**

Edit `components/FieldCanvas.tsx` line 10-17，找到：

```typescript
interface FieldCanvasProps {
  path: PathPoint[];
  onPathChange: (path: PathPoint[]) => void;
  alliance: 'red' | 'blue';
  climbTime?: number;
  onClimbTimeChange?: (val: number) => void;
  climbLabel?: string;
}
```

改成：
```typescript
interface FieldCanvasProps {
  path: PathPoint[];
  onPathChange: (path: PathPoint[]) => void;
  alliance: 'red' | 'blue';
  climbTime?: number;
  onClimbTimeChange?: (val: number) => void;
  climbLabel?: string;
  isFlipped: boolean;
  onFlipChange: (flipped: boolean) => void;
}
```

接著找到 component signature（line 33）：

```typescript
export const FieldCanvas: FC<FieldCanvasProps> = ({ path, onPathChange, alliance, climbTime, onClimbTimeChange, climbLabel }) => {
```

改成：
```typescript
export const FieldCanvas: FC<FieldCanvasProps> = ({ path, onPathChange, alliance, climbTime, onClimbTimeChange, climbLabel, isFlipped, onFlipChange }) => {
```

- [ ] **Step 6: Build 驗證**

Run: `cd D:/FRC/frc-6998-scouting-pass/FRC && npm run build`
Expected: TypeScript 編譯通過，零 errors。`isFlipped` / `onFlipChange` 在 FieldCanvas 暫時 unused — TypeScript 不會對 unused destructured prop 報錯。

如果 build 失敗：
- 看錯誤訊息找漏掉的步驟
- 常見問題：line number 偏移（如果先前已改過附近程式碼）→ 用 Grep 找 anchor pattern

- [ ] **Step 7: Commit**

```bash
cd D:/FRC/frc-6998-scouting-pass/FRC
git add App.tsx components/TabViews.tsx components/FieldCanvas.tsx
git commit -m "feat(field): plumb isFlipped state from App through AutonTab to FieldCanvas"
```

---

## Task 3: 在 `getPointFromEvent` 加座標反向變換

**Goal:** 當 `isFlipped === true` 時，使用者點擊位置對應的儲存座標翻轉成 `(100 - x, 100 - y)`，這樣 `path[]` 永遠存「原始視角」座標。

**Files:**
- Modify: `components/FieldCanvas.tsx`（line 276-288 的 `getPointFromEvent`）

- [ ] **Step 1: 改 `getPointFromEvent` 加翻轉邏輯**

Edit `components/FieldCanvas.tsx` line 276-288，找到：

```typescript
  // Convert pointer event to percentage coordinates
  const getPointFromEvent = useCallback((e: PointerEvent): PathPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  }, []);
```

改成：
```typescript
  // Convert pointer event to percentage coordinates
  // When isFlipped, the canvas is visually rotated 180° but pointer events use viewport coords;
  // we invert (x, y) so the stored point[] always uses the original (un-flipped) reference frame.
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

    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  }, [isFlipped]);
```

- [ ] **Step 2: Build 驗證**

Run: `cd D:/FRC/frc-6998-scouting-pass/FRC && npm run build`
Expected: TypeScript 編譯通過。因為 `isFlipped` 永遠是 false（按鈕還沒加），既有畫線行為不變。

- [ ] **Step 3: Manual smoke test**

Run: `cd D:/FRC/frc-6998-scouting-pass/FRC && npm run dev` (background)
Open: `http://localhost:5173`
Action: 進到 Auton phase，畫一條線，確認線出現在手指經過的位置（跟以前一樣）。
Expected: 行為跟以前完全一樣（因為 `isFlipped` 永遠是 false）。

如果有異常，問題在 Step 1 程式碼 — 檢查 destructure / type / 邏輯。

- [ ] **Step 4: Commit**

```bash
cd D:/FRC/frc-6998-scouting-pass/FRC
git add components/FieldCanvas.tsx
git commit -m "feat(field): invert pointer coords when isFlipped to keep stored path in original frame"
```

---

## Task 4: 行內視圖 — DOM 重構 + Flip 按鈕

**Goal:** 在行內（非 fullscreen）視圖加翻轉內層 div、Flip 按鈕（右上角 Maximize 左邊）、隱藏 starting zone 文字標籤（翻轉時）。

**Files:**
- Modify: `components/FieldCanvas.tsx`（line 4 import、line 463-524 的行內視圖 JSX）

- [ ] **Step 1: 加 `RotateCcw` 到 lucide-react import**

Edit `components/FieldCanvas.tsx` line 4，找到：

```typescript
import { Trash2, Undo2, Share2, AlertTriangle, Maximize2, Minimize2, Play, Square } from 'lucide-react';
```

改成：
```typescript
import { Trash2, Undo2, Share2, AlertTriangle, Maximize2, Minimize2, Play, Square, RotateCcw } from 'lucide-react';
```

- [ ] **Step 2: 改行內視圖 DOM — 加翻轉內層 div、Flip 按鈕、starting zone label 條件渲染**

Edit `components/FieldCanvas.tsx` line 463-524。找到整段：

```typescript
  return (
    <div className="space-y-2">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        data-swipe-ignore
        className="relative w-full rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900"
        style={{ touchAction: 'none', height: canvasSize.height || 'auto' }}
      >
        {/* Field Background Image */}
        <img
          src={fieldImage}
          alt="FRC Field"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          draggable={false}
        />

        {/* Alliance indicator */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold z-20 ${
          alliance === 'red' ? 'bg-red-500/30 text-red-400' : 'bg-blue-500/30 text-blue-400'
        }`}>
          {alliance === 'red' ? 'RED' : 'BLUE'}
        </div>

        {/* Fullscreen button */}
        <button
          onClick={handleEnterFullscreen}
          className="absolute top-2 right-2 p-1.5 rounded bg-slate-900/70 border border-slate-600 text-slate-300 hover:text-white z-20 transition-all active:scale-95"
        >
          <Maximize2 size={16} />
        </button>

        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="absolute inset-0 z-10 cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        {/* Hint text when empty */}
        {path.length === 0 && currentStroke.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="text-slate-500 text-sm bg-slate-900/80 px-3 py-1 rounded-full">
              {t('drawPathHint')}
            </span>
          </div>
        )}

        {/* Starting zone label - centered in the alliance-specific zone */}
        <div
          className="absolute top-2 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 pointer-events-none z-20"
          style={{ left: `${startingZoneOffset + STARTING_ZONE_WIDTH / 2}%`, transform: 'translateX(-50%)' }}
        >
          {t('startingZone')}
        </div>
      </div>
```

整段改成：

```typescript
  return (
    <div className="space-y-2">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        data-swipe-ignore
        className="relative w-full rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900"
        style={{ touchAction: 'none', height: canvasSize.height || 'auto' }}
      >
        {/* Flip layer — visually rotated 180° when isFlipped; contains background + drawing canvas */}
        <div
          className="absolute inset-0"
          style={isFlipped ? { transform: 'rotate(180deg)' } : undefined}
        >
          {/* Field Background Image */}
          <img
            src={fieldImage}
            alt="FRC Field"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            draggable={false}
          />

          {/* Drawing Canvas */}
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="absolute inset-0 z-10 cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>

        {/* Alliance indicator — outside flip layer, stays upright top-left */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold z-20 ${
          alliance === 'red' ? 'bg-red-500/30 text-red-400' : 'bg-blue-500/30 text-blue-400'
        }`}>
          {alliance === 'red' ? 'RED' : 'BLUE'}
        </div>

        {/* Top-right buttons cluster: Flip + Fullscreen */}
        <div className="absolute top-2 right-2 z-20 flex gap-1.5">
          <button
            onClick={() => onFlipChange(!isFlipped)}
            aria-label={t('flipField')}
            title={t('flipField')}
            className={`p-1.5 rounded border transition-all active:scale-95 ${
              isFlipped
                ? 'bg-brand-500/30 border-brand-500/50 text-brand-400'
                : 'bg-slate-900/70 border-slate-600 text-slate-300 hover:text-white'
            }`}
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={handleEnterFullscreen}
            className="p-1.5 rounded bg-slate-900/70 border border-slate-600 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Hint text when empty — outside flip layer, always upright */}
        {path.length === 0 && currentStroke.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="text-slate-500 text-sm bg-slate-900/80 px-3 py-1 rounded-full">
              {t('drawPathHint')}
            </span>
          </div>
        )}

        {/* Starting zone label — hidden when flipped (green zone background still visible) */}
        {!isFlipped && (
          <div
            className="absolute top-2 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 pointer-events-none z-20"
            style={{ left: `${startingZoneOffset + STARTING_ZONE_WIDTH / 2}%`, transform: 'translateX(-50%)' }}
          >
            {t('startingZone')}
          </div>
        )}
      </div>
```

- [ ] **Step 3: Build 驗證**

Run: `cd D:/FRC/frc-6998-scouting-pass/FRC && npm run build`
Expected: TypeScript 編譯通過，零 errors。

- [ ] **Step 4: Manual test — 行內視圖**

Run: dev server 應該還在背景跑（如果沒有，重起 `npm run dev`）
Open: 確保 portrait 方向（手機 / 視窗變窄）以避免自動進 fullscreen
Action 1: 進到 Auton phase，先畫一條線（從紅方起始區出發）
Action 2: 按右上角 Flip 按鈕（旋轉 icon）
Expected:
- 場地圖、現有路徑、起始區域**綠色背景** 全部翻轉 180°
- 紅方起始區綠色背景出現在右上方（原本在左下方）
- 「Starting Zone」綠色文字標籤**消失**
- Alliance 標籤（紅色 RED 或藍色 BLUE）保持 top-left 且文字正向
- Flip 按鈕變 cyan 高亮、Maximize 按鈕保持原樣
- Hint 文字（如果有）保持中央正向

Action 3: 在翻轉視角下畫新一條線
Expected: 線出現在手指經過的視覺位置（不會「畫到旁邊去」）

Action 4: 再按一次 Flip 按鈕回正向
Expected:
- 場地、路徑（剛畫的 + 之前的）回到正向視角，**所有路徑視覺位置正確**（資料未丟）
- 「Starting Zone」標籤恢復顯示
- Flip 按鈕回到一般灰色樣式

如果有任何項目不對 → 看 Step 2 程式碼是否漏掉什麼。

- [ ] **Step 5: Commit**

```bash
cd D:/FRC/frc-6998-scouting-pass/FRC
git add components/FieldCanvas.tsx
git commit -m "feat(field): add Flip button + DOM restructure for inline view"
```

---

## Task 5: Fullscreen 視圖 — DOM 重構 + Flip 按鈕

**Goal:** 同樣處理應用到 fullscreen portal 視圖。Flip 按鈕加在左側 vertical bar 內（Clear/Undo 之後、Stopwatch 之前）。

**Files:**
- Modify: `components/FieldCanvas.tsx`（line 392-461 的 fullscreen portal JSX）

- [ ] **Step 1: 改 fullscreen portal — 加翻轉內層 div、隱藏 starting zone label**

Edit `components/FieldCanvas.tsx` line 392-461。找到整段 `if (isFullscreen) { return createPortal(...)}`：

```typescript
  // Fullscreen overlay - portal to document.body to escape parent stacking contexts (header/footer z-index)
  if (isFullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center" style={{ width: '100dvw', height: '100dvh' }} data-swipe-ignore>
        {/* Exit fullscreen - top right, highest z-index */}
        <button onClick={() => setIsFullscreen(false)}
          className="absolute top-3 right-3 z-30 p-2.5 rounded-xl bg-black/60 border border-slate-500 text-white transition-all active:scale-95">
          <Minimize2 size={20} />
        </button>

        {/* Field container - exact 2:1 ratio, centered in viewport */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ touchAction: 'none', width: canvasSize.width, height: canvasSize.height }}
        >
          <img src={fieldImage} alt="FRC Field" className="absolute inset-0 w-full h-full object-fill pointer-events-none" draggable={false} />
          <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold z-20 ${alliance === 'red' ? 'bg-red-500/30 text-red-400' : 'bg-blue-500/30 text-blue-400'}`}>
            {alliance === 'red' ? 'RED' : 'BLUE'}
          </div>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="absolute inset-0 z-10 cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
          {path.length === 0 && currentStroke.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <span className="text-slate-500 text-sm bg-slate-900/80 px-3 py-1 rounded-full">{t('drawPathHint')}</span>
            </div>
          )}
          <div className="absolute top-2 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 pointer-events-none z-20"
            style={{ left: `${startingZoneOffset + STARTING_ZONE_WIDTH / 2}%`, transform: 'translateX(-50%)' }}>
            {t('startingZone')}
          </div>
        </div>

        {/* Fullscreen left bar - vertical centered */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 bg-black/60 rounded-2xl p-2">
          <button onClick={handleClear} disabled={path.length === 0}
            className="p-3 rounded-xl text-red-400 disabled:opacity-30 transition-all active:scale-95">
            <Trash2 size={20} />
          </button>
          <button onClick={handleUndo} disabled={path.length === 0}
            className="p-3 rounded-xl text-orange-400 disabled:opacity-30 transition-all active:scale-95">
            <Undo2 size={20} />
          </button>

          {/* Climb Time Stopwatch */}
          {onClimbTimeChange && (
            <>
              <div className={`text-lg font-display font-black tabular-nums text-center ${swRunning ? 'text-amber-400' : 'text-white'}`}>
                {swDisplay.toFixed(2)}
              </div>
              <button onClick={swStartStop}
                className={`p-3 rounded-xl transition-all active:scale-95 ${swRunning ? 'text-red-400' : 'text-amber-400'}`}>
                {swRunning ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
            </>
          )}
        </div>
      </div>,
      document.body
    );
  }
```

整段改成：

```typescript
  // Fullscreen overlay - portal to document.body to escape parent stacking contexts (header/footer z-index)
  if (isFullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center" style={{ width: '100dvw', height: '100dvh' }} data-swipe-ignore>
        {/* Exit fullscreen - top right, highest z-index */}
        <button onClick={() => setIsFullscreen(false)}
          className="absolute top-3 right-3 z-30 p-2.5 rounded-xl bg-black/60 border border-slate-500 text-white transition-all active:scale-95">
          <Minimize2 size={20} />
        </button>

        {/* Field container - exact 2:1 ratio, centered in viewport */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ touchAction: 'none', width: canvasSize.width, height: canvasSize.height }}
        >
          {/* Flip layer — visually rotated 180° when isFlipped */}
          <div
            className="absolute inset-0"
            style={isFlipped ? { transform: 'rotate(180deg)' } : undefined}
          >
            <img src={fieldImage} alt="FRC Field" className="absolute inset-0 w-full h-full object-fill pointer-events-none" draggable={false} />
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="absolute inset-0 z-10 cursor-crosshair"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>

          {/* Alliance indicator — outside flip layer */}
          <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold z-20 ${alliance === 'red' ? 'bg-red-500/30 text-red-400' : 'bg-blue-500/30 text-blue-400'}`}>
            {alliance === 'red' ? 'RED' : 'BLUE'}
          </div>

          {/* Hint text — outside flip layer */}
          {path.length === 0 && currentStroke.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <span className="text-slate-500 text-sm bg-slate-900/80 px-3 py-1 rounded-full">{t('drawPathHint')}</span>
            </div>
          )}

          {/* Starting zone label — hidden when flipped */}
          {!isFlipped && (
            <div className="absolute top-2 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 pointer-events-none z-20"
              style={{ left: `${startingZoneOffset + STARTING_ZONE_WIDTH / 2}%`, transform: 'translateX(-50%)' }}>
              {t('startingZone')}
            </div>
          )}
        </div>

        {/* Fullscreen left bar - vertical centered */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 bg-black/60 rounded-2xl p-2">
          <button onClick={handleClear} disabled={path.length === 0}
            className="p-3 rounded-xl text-red-400 disabled:opacity-30 transition-all active:scale-95">
            <Trash2 size={20} />
          </button>
          <button onClick={handleUndo} disabled={path.length === 0}
            className="p-3 rounded-xl text-orange-400 disabled:opacity-30 transition-all active:scale-95">
            <Undo2 size={20} />
          </button>
          <button onClick={() => onFlipChange(!isFlipped)}
            aria-label={t('flipField')}
            title={t('flipField')}
            className={`p-3 rounded-xl transition-all active:scale-95 ${
              isFlipped ? 'text-brand-400 bg-brand-500/20' : 'text-slate-300'
            }`}>
            <RotateCcw size={20} />
          </button>

          {/* Climb Time Stopwatch */}
          {onClimbTimeChange && (
            <>
              <div className={`text-lg font-display font-black tabular-nums text-center ${swRunning ? 'text-amber-400' : 'text-white'}`}>
                {swDisplay.toFixed(2)}
              </div>
              <button onClick={swStartStop}
                className={`p-3 rounded-xl transition-all active:scale-95 ${swRunning ? 'text-red-400' : 'text-amber-400'}`}>
                {swRunning ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
            </>
          )}
        </div>
      </div>,
      document.body
    );
  }
```

- [ ] **Step 2: Build 驗證**

Run: `cd D:/FRC/frc-6998-scouting-pass/FRC && npm run build`
Expected: TypeScript 編譯通過，零 errors。

- [ ] **Step 3: Manual test — fullscreen 視圖**

Open: dev server，進到 Auton phase
Action 1: 按右上角 Maximize 按鈕進 fullscreen（或把裝置/視窗轉成 landscape）
Action 2: 在 fullscreen 模式下按左側 bar 的 Flip 按鈕（Clear / Undo 之後）
Expected:
- 場地圖 + canvas 翻轉 180°
- Alliance 標籤、Hint 文字保持位置與正向
- Flip 按鈕變 cyan 高亮
- Starting zone 文字標籤消失

Action 3: 在 fullscreen + 翻轉狀態下畫線
Expected: 線位置正確

Action 4: 按 Minimize 退出 fullscreen 回行內視圖
Expected: 翻轉狀態仍然維持（行內視圖也是翻轉的）、剛畫的線視覺位置正確

Action 5: 在行內視圖按 Flip 回正向，再進 fullscreen
Expected: fullscreen 也是正向（state 共享）

- [ ] **Step 4: Commit**

```bash
cd D:/FRC/frc-6998-scouting-pass/FRC
git add components/FieldCanvas.tsx
git commit -m "feat(field): add Flip button + DOM restructure for fullscreen view"
```

---

## Task 6: 完整手動驗證（spec 14 項）

**Goal:** 對照 spec section 9 的 14 個驗證項目逐一手動測試，確保功能完整且無 regression。

**Files:** None (read-only verification)

- [ ] **Step 1: 跑完整 manual checklist**

Run: dev server (`npm run dev`)，進 Auton phase

逐一執行並打勾：

1. [ ] 按 Flip → 場地圖、現有路徑、起始區域綠色背景**全部翻轉 180°**
2. [ ] 按鈕、alliance 標籤、警告 banner **不翻**且文字正向
3. [ ] Starting Zone 文字標籤翻轉時消失，回正時恢復
4. [ ] 翻轉狀態下畫新路徑 → 視覺位置正確（手指放哪線就在哪）
5. [ ] 切回正向視角 → 既有路徑視覺位置正確（資料不丟、不錯位）
6. [ ] 翻轉狀態下匯出 PNG（按 Share 按鈕）→ 輸出**正向視角**的圖（不翻）
7. [ ] 翻轉狀態下到 QRCode phase 生成 QR → 用 scanner repo 解出來的座標跟「正向視角畫的路徑」相同
   - **如何驗證**：在翻轉狀態畫一條從紅方起始區到籃下的線、生成 QR、用 scanner app 掃描、確認解出的 path 點 X 在 25-28.5%（紅方起始區）開始
   - 或手動 inspect QR 內容（LZ-String compressed JSON）
8. [ ] Fullscreen ↔ 行內 切換（用 Maximize/Minimize 按鈕） → 翻轉狀態維持
9. [ ] 旋轉裝置（landscape ↔ portrait）→ 翻轉狀態維持
10. [ ] 切離 Auton phase 切到 Teleop / PostMatch 再切回 Auton → **翻轉狀態維持**
11. [ ] 在 QRCode phase 按 Reset Match → 切到下一場、進到 Auton → **翻轉狀態維持**
12. [ ] 重新整理頁面（F5 / Cmd-R）→ 翻轉狀態回到正向（消失）
13. [ ] Flip 按鈕啟用中 → cyan 高亮顯示（行內 + fullscreen 都看）
14. [ ] `npm run build` 通過、零 TypeScript errors（Task 2/3/4/5 都做過了，這裡再跑一次最終確認）

- [ ] **Step 2: 如果發現問題 → 修 + commit**

如果 Step 1 任何項目失敗：
1. 找 root cause（DOM 結構、座標公式、prop 傳遞、CSS）
2. 改完後跑 `npm run build` 驗證
3. 跑 failing item 的測試確認修好
4. Commit `fix(field): <根因描述>`

如果都通過 → 沒有額外 commit。

- [ ] **Step 3: 通知使用者完成**

向使用者報告：
- 已完成的 commit list
- 14 項驗證結果
- 任何發現的 caveat
- 提醒：**沒有 schema 改動，不需要 GAS 部署或 fixHeaders**，scanner repo 也不需要改

---

## Self-Review Notes（plan 寫完後的內部檢查）

**Spec coverage check：**
- ✅ Section 1 架構（state 在 App.tsx）→ Task 2 Step 1
- ✅ Section 2 資料流（getPointFromEvent 翻轉）→ Task 3
- ✅ Section 3 DOM 重構（行內 + fullscreen）→ Task 4 + Task 5
- ✅ Section 4 數學公式（100-x, 100-y）→ Task 3 Step 1
- ✅ Section 5 UI（按鈕位置、icon、cyan 高亮）→ Task 4 Step 2 + Task 5 Step 1
- ✅ Section 6 邊界情況 → Task 6 Step 1 (#5, #6, #8, #9, #10, #11, #12)
- ✅ Section 7 i18n → Task 1
- ✅ Section 8 YAGNI → 沒做不該做的（沒 localStorage、沒 reset 歸零）
- ✅ Section 9 驗證 → Task 6 Step 1
- ✅ Section 10 實作步驟 → 拆成 Task 1-5

**Placeholder scan：** 無 TBD/TODO/「fill in」/「similar to Task N」。所有 code 完整貼出。

**Type consistency：** `isFlipped: boolean` + `onFlipChange: (flipped: boolean) => void` 在 App.tsx state、AutonTabProps、FieldCanvasProps 三處統一。

**Commit message 風格：** 用 `feat(scope): ...`、`fix(scope): ...`、`feat(i18n): ...`，跟既有 git history 一致（`ec47280 feat: default both climb statuses to Level1...`）。

**Risks revisited from spec：**
- Prop drilling 漏接 → Task 2 一次到位、Step 6 build 驗證
- 座標公式錯 → Task 3 Step 3 即時 smoke test
- Fullscreen / 行內 漏改 → Task 4 + Task 5 分開、各自 manual verify
- Share PNG 翻轉 → Task 6 Step 1 #6 專門驗證

---

*Last updated: 2026-04-28*
