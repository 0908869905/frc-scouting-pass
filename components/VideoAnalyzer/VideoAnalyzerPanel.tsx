import React, { useState, useCallback, useRef } from 'react';
import { Upload, Play, Square, Trash2, Bot, Target, Circle } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { AnnotationCanvas } from './AnnotationCanvas';
import { AnalysisResults } from './AnalysisResults';
import type {
  VideoMetadata,
  AnnotationMode,
  AnnotationState,
  BoundingBox,
  RobotAnnotation,
  HubAnnotation,
  FuelSample,
  MatchInfo,
  AnalysisResult,
} from './types';

const API_BASE = 'http://localhost:8000/api/v1';

export const VideoAnalyzerPanel: React.FC = () => {
  // Video state
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string>('');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [firstFrameImage, setFirstFrameImage] = useState<string | null>(null);

  // Match info
  const [matchInfo, setMatchInfo] = useState<MatchInfo>({
    eventCode: '',
    matchLevel: 'quals',
    matchNumber: 1,
  });

  // Annotation state
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>('none');
  const [annotations, setAnnotations] = useState<AnnotationState>({
    robots: [],
    hubs: [],
    fuelSample: null,
  });
  const [pendingRobotAlliance, setPendingRobotAlliance] = useState<'red' | 'blue'>('red');
  const [pendingTeamNumber, setPendingTeamNumber] = useState<string>('');

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle video file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoPath(file.name);
    setAnnotations({ robots: [], hubs: [], fuelSample: null });
    setAnalysisResult(null);
  }, []);

  // Handle first frame ready
  const handleFirstFrameReady = useCallback((canvas: HTMLCanvasElement) => {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setFirstFrameImage(dataUrl);
  }, []);

  // Add robot annotation
  const handleRobotAdd = useCallback((bbox: BoundingBox) => {
    const teamNumber = parseInt(pendingTeamNumber) || 0;
    if (teamNumber <= 0) {
      alert('Please enter a valid team number first');
      return;
    }

    const newRobot: RobotAnnotation = {
      id: `robot-${Date.now()}`,
      teamNumber,
      alliance: pendingRobotAlliance,
      bbox,
    };

    setAnnotations((prev) => ({
      ...prev,
      robots: [...prev.robots, newRobot],
    }));

    setPendingTeamNumber('');
  }, [pendingTeamNumber, pendingRobotAlliance]);

  // Add hub annotation
  const handleHubAdd = useCallback((bbox: BoundingBox) => {
    const newHub: HubAnnotation = {
      id: `hub-${Date.now()}`,
      alliance: pendingRobotAlliance,
      bbox,
    };

    setAnnotations((prev) => ({
      ...prev,
      hubs: [...prev.hubs, newHub],
    }));
  }, [pendingRobotAlliance]);

  // Set fuel sample
  const handleFuelSampleSet = useCallback((bbox: BoundingBox) => {
    const newSample: FuelSample = {
      id: `fuel-${Date.now()}`,
      bbox,
    };

    setAnnotations((prev) => ({
      ...prev,
      fuelSample: newSample,
    }));

    setAnnotationMode('none');
  }, []);

  // Delete robot annotation
  const handleDeleteRobot = useCallback((id: string) => {
    setAnnotations((prev) => ({
      ...prev,
      robots: prev.robots.filter((r) => r.id !== id),
    }));
  }, []);

  // Start analysis
  const handleStartAnalysis = useCallback(async () => {
    if (!videoPath || annotations.robots.length === 0) {
      alert('Please load a video and add robot annotations');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis progress (in production, this would poll the API)
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 200);

    // Simulate analysis completion
    setTimeout(() => {
      clearInterval(interval);
      setAnalysisProgress(100);

      // Generate mock results
      const mockResult: AnalysisResult = {
        matchInfo,
        teamStats: annotations.robots.map((robot) => ({
          teamNumber: robot.teamNumber,
          alliance: robot.alliance,
          autoScored: Math.floor(Math.random() * 5),
          autoMissed: Math.floor(Math.random() * 3),
          teleopScored: Math.floor(Math.random() * 15) + 5,
          teleopMissed: Math.floor(Math.random() * 8),
        })),
        analysisDurationSeconds: 10 + Math.random() * 5,
        frameCount: metadata?.frameCount || 0,
        shotsDetected: 30 + Math.floor(Math.random() * 20),
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 5000);
  }, [videoPath, annotations, matchInfo, metadata]);

  // Export TSV
  const handleExportTSV = useCallback(() => {
    if (!analysisResult) return;

    const header = ['Event', 'Match', 'Team', 'Alliance', 'Auto_Scored', 'Auto_Missed', 'Teleop_Scored', 'Teleop_Missed'];
    const rows = analysisResult.teamStats.map((stats) => [
      analysisResult.matchInfo.eventCode,
      `${analysisResult.matchInfo.matchLevel[0].toUpperCase()}${analysisResult.matchInfo.matchNumber}`,
      stats.teamNumber,
      stats.alliance,
      stats.autoScored,
      stats.autoMissed,
      stats.teleopScored,
      stats.teleopMissed,
    ]);

    const tsv = [header.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');

    // Download
    const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${matchInfo.eventCode}_${matchInfo.matchLevel}${matchInfo.matchNumber}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analysisResult, matchInfo]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Video Analyzer</h1>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded transition-colors"
          >
            <Upload className="w-4 h-4" />
            Load Video
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Video and Canvas */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <VideoPlayer
              videoSrc={videoSrc}
              onMetadataLoaded={setMetadata}
              onFirstFrameReady={handleFirstFrameReady}
            />

            {/* Annotation Canvas (shown when video is loaded) */}
            {firstFrameImage && metadata && (
              <div className="space-y-2">
                <h3 className="font-semibold">Annotation Canvas</h3>
                <AnnotationCanvas
                  width={metadata.width}
                  height={metadata.height}
                  backgroundImage={firstFrameImage}
                  mode={annotationMode}
                  robots={annotations.robots}
                  hubs={annotations.hubs}
                  fuelSample={annotations.fuelSample}
                  onRobotAdd={handleRobotAdd}
                  onHubAdd={handleHubAdd}
                  onFuelSampleSet={handleFuelSampleSet}
                />
              </div>
            )}
          </div>

          {/* Right Column: Controls and Results */}
          <div className="space-y-4">
            {/* Match Info */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Match Info</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400">Event Code</label>
                  <input
                    type="text"
                    value={matchInfo.eventCode}
                    onChange={(e) => setMatchInfo((m) => ({ ...m, eventCode: e.target.value }))}
                    placeholder="2026MSLR"
                    className="w-full px-3 py-2 bg-slate-700 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Match #</label>
                  <input
                    type="number"
                    value={matchInfo.matchNumber}
                    onChange={(e) => setMatchInfo((m) => ({ ...m, matchNumber: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-slate-700 rounded text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Match Level</label>
                <select
                  value={matchInfo.matchLevel}
                  onChange={(e) => setMatchInfo((m) => ({ ...m, matchLevel: e.target.value as 'quals' | 'elims' }))}
                  className="w-full px-3 py-2 bg-slate-700 rounded text-sm"
                >
                  <option value="quals">Quals</option>
                  <option value="elims">Elims</option>
                </select>
              </div>
            </div>

            {/* Annotation Tools */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Annotation Tools</h3>

              {/* Alliance selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setPendingRobotAlliance('red')}
                  className={`flex-1 py-2 rounded font-semibold transition-colors ${
                    pendingRobotAlliance === 'red'
                      ? 'bg-red-600'
                      : 'bg-slate-700 hover:bg-red-600/50'
                  }`}
                >
                  Red
                </button>
                <button
                  onClick={() => setPendingRobotAlliance('blue')}
                  className={`flex-1 py-2 rounded font-semibold transition-colors ${
                    pendingRobotAlliance === 'blue'
                      ? 'bg-blue-600'
                      : 'bg-slate-700 hover:bg-blue-600/50'
                  }`}
                >
                  Blue
                </button>
              </div>

              {/* Team number input (for robot mode) */}
              <div>
                <label className="text-xs text-slate-400">Team Number</label>
                <input
                  type="number"
                  value={pendingTeamNumber}
                  onChange={(e) => setPendingTeamNumber(e.target.value)}
                  placeholder="6998"
                  className="w-full px-3 py-2 bg-slate-700 rounded text-sm"
                />
              </div>

              {/* Tool buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAnnotationMode(annotationMode === 'robot' ? 'none' : 'robot')}
                  className={`flex flex-col items-center gap-1 p-3 rounded transition-colors ${
                    annotationMode === 'robot' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <Bot className="w-5 h-5" />
                  <span className="text-xs">Robot</span>
                </button>
                <button
                  onClick={() => setAnnotationMode(annotationMode === 'hub' ? 'none' : 'hub')}
                  className={`flex flex-col items-center gap-1 p-3 rounded transition-colors ${
                    annotationMode === 'hub' ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <Target className="w-5 h-5" />
                  <span className="text-xs">HUB</span>
                </button>
                <button
                  onClick={() => setAnnotationMode(annotationMode === 'fuel' ? 'none' : 'fuel')}
                  className={`flex flex-col items-center gap-1 p-3 rounded transition-colors ${
                    annotationMode === 'fuel' ? 'bg-yellow-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <Circle className="w-5 h-5" />
                  <span className="text-xs">FUEL</span>
                </button>
              </div>

              {/* Annotation list */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {annotations.robots.map((robot) => (
                  <div
                    key={robot.id}
                    className={`flex items-center justify-between px-2 py-1 rounded text-sm ${
                      robot.alliance === 'red' ? 'bg-red-900/30' : 'bg-blue-900/30'
                    }`}
                  >
                    <span>Robot: {robot.teamNumber}</span>
                    <button
                      onClick={() => handleDeleteRobot(robot.id)}
                      className="p-1 hover:bg-slate-600 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {annotations.hubs.map((hub) => (
                  <div
                    key={hub.id}
                    className={`px-2 py-1 rounded text-sm ${
                      hub.alliance === 'red' ? 'bg-red-900/30' : 'bg-blue-900/30'
                    }`}
                  >
                    HUB ({hub.alliance})
                  </div>
                ))}
                {annotations.fuelSample && (
                  <div className="px-2 py-1 rounded text-sm bg-yellow-900/30">
                    FUEL Sample
                  </div>
                )}
              </div>
            </div>

            {/* Start Analysis Button */}
            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing || !videoSrc || annotations.robots.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded font-semibold transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Square className="w-5 h-5" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Analysis
                </>
              )}
            </button>

            {/* Analysis Results */}
            <AnalysisResults
              result={analysisResult}
              isAnalyzing={isAnalyzing}
              progress={analysisProgress}
              onExportTSV={handleExportTSV}
              onUploadToSheets={() => alert('Upload to Sheets - Coming Soon')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
