import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { BoundingBox, RobotAnnotation, HubAnnotation, FuelSample, AnnotationMode } from './types';

interface AnnotationCanvasProps {
  width: number;
  height: number;
  backgroundImage?: string;
  mode: AnnotationMode;
  robots: RobotAnnotation[];
  hubs: HubAnnotation[];
  fuelSample: FuelSample | null;
  onRobotAdd: (bbox: BoundingBox) => void;
  onHubAdd: (bbox: BoundingBox) => void;
  onFuelSampleSet: (bbox: BoundingBox) => void;
  onAnnotationSelect?: (type: 'robot' | 'hub' | 'fuel', id: string) => void;
}

interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const MODE_STYLES: Record<Exclude<AnnotationMode, 'none'>, { color: string; label: string }> = {
  robot: { color: '#a78bfa', label: 'Robot' },
  hub: { color: '#34d399', label: 'HUB' },
  fuel: { color: '#fbbf24', label: 'FUEL' },
};

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  width,
  height,
  backgroundImage,
  mode,
  robots,
  hubs,
  fuelSample,
  onRobotAdd,
  onHubAdd,
  onFuelSampleSet,
  onAnnotationSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  const [scale, setScale] = useState(1);

  // Calculate scale based on container size
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && width > 0) {
        const containerWidth = containerRef.current.clientWidth;
        setScale(containerWidth / width);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [width]);

  // Get mouse position relative to canvas
  const getMousePos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  }, [scale]);

  // Draw all annotations
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background image if provided
    if (backgroundImage) {
      const img = new Image();
      img.src = backgroundImage;
      ctx.drawImage(img, 0, 0, width, height);
    }

    // Draw HUBs
    hubs.forEach((hub) => {
      const color = hub.alliance === 'red' ? '#ef4444' : '#3b82f6';
      drawBox(ctx, hub.bbox, color, `HUB (${hub.alliance})`);
    });

    // Draw robots
    robots.forEach((robot) => {
      const color = robot.alliance === 'red' ? '#f87171' : '#60a5fa';
      drawBox(ctx, robot.bbox, color, `${robot.teamNumber}`);
    });

    // Draw fuel sample
    if (fuelSample) {
      drawBox(ctx, fuelSample.bbox, '#fbbf24', 'FUEL');
    }

    // Draw current drawing preview
    if (drawing.isDrawing && mode !== 'none') {
      const previewBox: BoundingBox = {
        x1: Math.min(drawing.startX, drawing.currentX),
        y1: Math.min(drawing.startY, drawing.currentY),
        x2: Math.max(drawing.startX, drawing.currentX),
        y2: Math.max(drawing.startY, drawing.currentY),
      };

      const style = MODE_STYLES[mode];
      ctx.setLineDash([5, 5]);
      drawBox(ctx, previewBox, style.color, style.label);
      ctx.setLineDash([]);
    }
  }, [width, height, backgroundImage, robots, hubs, fuelSample, drawing, mode]);

  // Draw a bounding box with label
  const drawBox = (
    ctx: CanvasRenderingContext2D,
    bbox: BoundingBox,
    color: string,
    label: string
  ) => {
    const { x1, y1, x2, y2 } = bbox;

    // Draw rectangle
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    // Draw semi-transparent fill
    ctx.fillStyle = color + '20';
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

    // Draw label background
    ctx.fillStyle = color;
    const labelHeight = 18;
    const labelWidth = ctx.measureText(label).width + 8;
    ctx.fillRect(x1, y1 - labelHeight, labelWidth, labelHeight);

    // Draw label text
    ctx.fillStyle = '#000000';
    ctx.font = '12px sans-serif';
    ctx.fillText(label, x1 + 4, y1 - 5);
  };

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (mode === 'none') return;

    const pos = getMousePos(e);
    setDrawing({
      isDrawing: true,
      startX: pos.x,
      startY: pos.y,
      currentX: pos.x,
      currentY: pos.y,
    });
  }, [mode, getMousePos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drawing.isDrawing) return;

    const pos = getMousePos(e);
    setDrawing((prev) => ({
      ...prev,
      currentX: pos.x,
      currentY: pos.y,
    }));
  }, [drawing.isDrawing, getMousePos]);

  const handleMouseUp = useCallback(() => {
    if (!drawing.isDrawing) return;

    const bbox: BoundingBox = {
      x1: Math.min(drawing.startX, drawing.currentX),
      y1: Math.min(drawing.startY, drawing.currentY),
      x2: Math.max(drawing.startX, drawing.currentX),
      y2: Math.max(drawing.startY, drawing.currentY),
    };

    // Only add if box has some size
    const minSize = 10;
    if (bbox.x2 - bbox.x1 > minSize && bbox.y2 - bbox.y1 > minSize) {
      switch (mode) {
        case 'robot':
          onRobotAdd(bbox);
          break;
        case 'hub':
          onHubAdd(bbox);
          break;
        case 'fuel':
          onFuelSampleSet(bbox);
          break;
      }
    }

    setDrawing({
      isDrawing: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  }, [drawing, mode, onRobotAdd, onHubAdd, onFuelSampleSet]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: 'auto' }}
        className={`border border-slate-600 rounded cursor-${mode === 'none' ? 'default' : 'crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Mode indicator */}
      {mode !== 'none' && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 rounded text-xs">
          Drawing: <span className="text-cyan-400 font-bold">{mode.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
};
