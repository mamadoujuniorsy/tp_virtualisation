export interface DetectedObject {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

export interface AnalysisState {
  loading: boolean;
  result: string | null;
  error: string | null;
}

export interface HistoryItem {
  id: number;
  date_scan: string;
  objects_found: string;
  analysis_summary: string;
  image_preview?: string; // Optional base64 snippet
}

export enum ViewMode {
  UPLOAD = 'UPLOAD',
  WEBCAM = 'WEBCAM',
  ANALYSIS = 'ANALYSIS',
  HISTORY = 'HISTORY'
}