/**
 * Types for Video Analyzer components
 */

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RobotAnnotation {
  id: string;
  teamNumber: number;
  alliance: 'red' | 'blue';
  bbox: BoundingBox;
}

export interface HubAnnotation {
  id: string;
  alliance: 'red' | 'blue';
  bbox: BoundingBox;
}

export interface FuelSample {
  id: string;
  bbox: BoundingBox;
}

export interface MatchInfo {
  eventCode: string;
  matchLevel: 'quals' | 'elims';
  matchNumber: number;
}

export interface TeamStats {
  teamNumber: number;
  alliance: 'red' | 'blue';
  autoScored: number;
  autoMissed: number;
  teleopScored: number;
  teleopMissed: number;
}

export interface AnalysisResult {
  matchInfo: MatchInfo;
  teamStats: TeamStats[];
  analysisDurationSeconds: number;
  frameCount: number;
  shotsDetected: number;
}

export interface VideoMetadata {
  fps: number;
  width: number;
  height: number;
  frameCount: number;
  durationSeconds: number;
}

export type AnnotationMode = 'none' | 'robot' | 'hub' | 'fuel';

export interface AnnotationState {
  robots: RobotAnnotation[];
  hubs: HubAnnotation[];
  fuelSample: FuelSample | null;
}
