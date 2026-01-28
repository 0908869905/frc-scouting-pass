import { useRef, useEffect, useState, useCallback, PointerEvent, useMemo } from 'react';
import type { FC } from 'react';
import { Trash2, Undo2, Share2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PathPoint } from '../types';
import { STARTING_ZONE_WIDTH, RED_STARTING_ZONE_OFFSET, BLUE_STARTING_ZONE_OFFSET } from '../constants';
import fieldImage from '../field26.png';

interface FieldCanvasProps {
  path: PathPoint[];
  onPathChange: (path: PathPoint[]) => void;
  alliance: 'red' | 'blue';
}

// Full-field aspect ratio (height/width) - based on field26.png image
const FIELD_ASPECT_RATIO = 0.5;

export const FieldCanvas: FC<FieldCanvasProps> = ({ path, onPathChange, alliance }) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<PathPoint[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [loadedFieldImage, setLoadedFieldImage] = useState<HTMLImageElement | null>(null);

  // Get alliance-specific starting zone offset
  const startingZoneOffset = alliance === 'red' ? RED_STARTING_ZONE_OFFSET : BLUE_STARTING_ZONE_OFFSET;

  // Check if the first point is in the starting zone
  // Red: X = 50-70%, Blue: X = 30-50%
  const isStartInValidZone = useMemo(() => {
    if (path.length === 0) return true; // No path yet, no warning
    const firstPoint = path[0];
    const zoneStart = startingZoneOffset;
    const zoneEnd = startingZoneOffset + STARTING_ZONE_WIDTH;
    return firstPoint.x >= zoneStart && firstPoint.x <= zoneEnd;
  }, [path, startingZoneOffset]);

  // Load field image (same for both alliances)
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoadedFieldImage(img);
    img.src = fieldImage;
  }, []);

  // Resize observer to handle responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const width = container.clientWidth;
      const height = Math.round(width * FIELD_ASPECT_RATIO);
      setCanvasSize({ width, height });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Draw path on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw starting zone indicator
    // Red: X = 50-70%, Blue: X = 30-50%
    const zoneStartX = (startingZoneOffset / 100) * canvasSize.width;
    const zoneWidth = (STARTING_ZONE_WIDTH / 100) * canvasSize.width;

    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)'; // Green tint
    ctx.fillRect(zoneStartX, 0, zoneWidth, canvasSize.height);

    // Draw border lines on both sides
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(zoneStartX, 0);
    ctx.lineTo(zoneStartX, canvasSize.height);
    ctx.moveTo(zoneStartX + zoneWidth, 0);
    ctx.lineTo(zoneStartX + zoneWidth, canvasSize.height);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    const allPoints = [...path, ...currentStroke];
    if (allPoints.length < 2) {
      // Draw single point if exists
      if (allPoints.length === 1) {
        const p = allPoints[0];
        const x = (p.x / 100) * canvasSize.width;
        const y = (p.y / 100) * canvasSize.height;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
      }
      return;
    }

    // Draw path line
    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const firstPoint = allPoints[0];
    ctx.moveTo(
      (firstPoint.x / 100) * canvasSize.width,
      (firstPoint.y / 100) * canvasSize.height
    );

    for (let i = 1; i < allPoints.length; i++) {
      const p = allPoints[i];
      ctx.lineTo(
        (p.x / 100) * canvasSize.width,
        (p.y / 100) * canvasSize.height
      );
    }
    ctx.stroke();

    // Draw start point (green)
    const start = allPoints[0];
    ctx.beginPath();
    ctx.arc(
      (start.x / 100) * canvasSize.width,
      (start.y / 100) * canvasSize.height,
      10, 0, Math.PI * 2
    );
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw end point (red)
    const end = allPoints[allPoints.length - 1];
    ctx.beginPath();
    ctx.arc(
      (end.x / 100) * canvasSize.width,
      (end.y / 100) * canvasSize.height,
      10, 0, Math.PI * 2
    );
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [path, currentStroke, canvasSize, startingZoneOffset]);

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

  const handlePointerDown = useCallback((e: PointerEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getPointFromEvent(e);
    setCurrentStroke([point]);
  }, [getPointFromEvent]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getPointFromEvent(e);
    setCurrentStroke(prev => {
      // Throttle: only add point if moved enough distance
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const dist = Math.sqrt(Math.pow(point.x - last.x, 2) + Math.pow(point.y - last.y, 2));
        if (dist < 1.5) return prev; // Skip if too close
      }
      return [...prev, point];
    });
  }, [isDrawing, getPointFromEvent]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      onPathChange([...path, ...currentStroke]);
      setCurrentStroke([]);
    }
  }, [isDrawing, currentStroke, path, onPathChange]);

  const handleClear = useCallback(() => {
    onPathChange([]);
    setCurrentStroke([]);
  }, [onPathChange]);

  const handleUndo = useCallback(() => {
    // Remove points from the last stroke (approximate by removing last 20% of points)
    if (path.length === 0) return;
    const removeCount = Math.max(1, Math.floor(path.length * 0.2));
    onPathChange(path.slice(0, -removeCount));
  }, [path, onPathChange]);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Create a new canvas with background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvasSize.width * 2; // 2x for better quality
    exportCanvas.height = canvasSize.height * 2;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(2, 2);

    // Draw field background image if loaded, otherwise use fallback color
    if (loadedFieldImage) {
      ctx.drawImage(loadedFieldImage, 0, 0, canvasSize.width, canvasSize.height);
    } else {
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    }

    // Draw the path from current canvas
    ctx.drawImage(canvas, 0, 0);

    // Convert to blob and share
    exportCanvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], 'auto-path.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Auto Path',
          });
        } catch (err) {
          // User cancelled or share failed - fallback to download
          downloadImage(blob);
        }
      } else {
        // Fallback: download image
        downloadImage(blob);
      }
    }, 'image/png');
  }, [canvasSize, loadedFieldImage]);

  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auto-path.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900"
        style={{ touchAction: 'none', height: canvasSize.height || 'auto' }}
      >
        {/* Field Background Image */}
        <img
          src={fieldImage}
          alt="FRC Field"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Alliance indicator */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold z-20 ${
          alliance === 'red' ? 'bg-red-500/30 text-red-400' : 'bg-blue-500/30 text-blue-400'
        }`}>
          {alliance === 'red' ? 'RED' : 'BLUE'}
        </div>

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

      {/* Warning when start point is outside starting zone */}
      {!isStartInValidZone && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/20 border border-orange-500/50 text-orange-400">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <span className="text-sm font-medium">{t('autoStartWarning')}</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleClear}
          disabled={path.length === 0}
          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <Trash2 size={18} />
          <span className="text-sm font-medium">{t('clearPath')}</span>
        </button>
        <button
          onClick={handleUndo}
          disabled={path.length === 0}
          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-500/20 border border-orange-500/50 text-orange-400 hover:bg-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <Undo2 size={18} />
          <span className="text-sm font-medium">{t('undoPath')}</span>
        </button>
        <button
          onClick={handleShare}
          disabled={path.length === 0}
          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-brand-500/20 border border-brand-500/50 text-brand-400 hover:bg-brand-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">{t('savePath')}</span>
        </button>
      </div>
    </div>
  );
};
