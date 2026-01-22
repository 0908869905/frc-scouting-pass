import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import type { VideoMetadata } from './types';

interface VideoPlayerProps {
  videoSrc: string | null;
  onMetadataLoaded?: (metadata: VideoMetadata) => void;
  onFrameChange?: (frameIndex: number) => void;
  onFirstFrameReady?: (canvas: HTMLCanvasElement) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSrc,
  onMetadataLoaded,
  onFrameChange,
  onFirstFrameReady,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  // Handle video metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const meta: VideoMetadata = {
      fps: 30, // Default, will be estimated
      width: video.videoWidth,
      height: video.videoHeight,
      frameCount: Math.round(video.duration * 30),
      durationSeconds: video.duration,
    };

    setMetadata(meta);
    setDuration(video.duration);
    onMetadataLoaded?.(meta);

    // Draw first frame to canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        onFirstFrameReady?.(canvasRef.current);
      }
    }
  }, [onMetadataLoaded, onFirstFrameReady]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !metadata) return;

    setCurrentTime(video.currentTime);
    const frameIndex = Math.round(video.currentTime * metadata.fps);
    onFrameChange?.(frameIndex);

    // Update canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
      }
    }
  }, [metadata, onFrameChange]);

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Seek to time
  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, duration));
  }, [duration]);

  // Step frame forward/backward
  const stepFrame = useCallback((direction: 1 | -1) => {
    const video = videoRef.current;
    if (!video || !metadata) return;

    const frameTime = 1 / metadata.fps;
    seekTo(video.currentTime + direction * frameTime);
  }, [metadata, seekTo]);

  // Format time display
  const formatTime = (time: number): string => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [handleLoadedMetadata, handleTimeUpdate]);

  if (!videoSrc) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600">
        <p className="text-slate-400">No video loaded</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      {/* Video Display */}
      <div className="relative">
        <video
          ref={videoRef}
          src={videoSrc}
          className="hidden"
          muted={isMuted}
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
        />
      </div>

      {/* Controls */}
      <div className="p-3 space-y-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 w-12">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.01}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-slate-400 w-12 text-right">{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => stepFrame(-1)}
            className="p-2 hover:bg-slate-700 rounded"
            title="Previous frame"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-full"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={() => stepFrame(1)}
            className="p-2 hover:bg-slate-700 rounded"
            title="Next frame"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-slate-700 rounded ml-4"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Frame Info */}
        {metadata && (
          <div className="text-xs text-slate-400 text-center">
            Frame: {Math.round(currentTime * metadata.fps)} / {metadata.frameCount} |
            {metadata.width}x{metadata.height} @ {metadata.fps}fps
          </div>
        )}
      </div>
    </div>
  );
};
