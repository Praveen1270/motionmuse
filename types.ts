
export enum PerformanceType {
  BALLET = 'Ballet',
  CONTEMPORARY = 'Contemporary',
  HIPHOP = 'Hip-hop',
  PIANO = 'Piano',
  VIOLIN = 'Violin',
  VOCALS = 'Vocals'
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  PROFESSIONAL = 'Professional'
}

export interface FeedbackMarker {
  type: string;
  x: number;
  y: number;
  color: string;
  label: string;
}

export interface TechniqueIssue {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  correction: string;
  visual_marker?: FeedbackMarker;
}

export interface PerformanceAnalysis {
  timestamp: string;
  technique_issues: TechniqueIssue[];
  strengths: string[];
  overall_score: number;
  timing_analysis?: {
    beat_offset_ms: number;
    tempo_drift_bpm: number;
    rhythmic_accuracy_score: number;
    issues: any[];
  };
  expression_analysis?: {
    emotional_authenticity_score: number;
    stage_presence_score: number;
    observations: any[];
  };
}

export interface SessionHistory {
  id: string;
  date: string;
  type: PerformanceType;
  score: number;
  technique: number;
  timing: number;
  expression: number;
}
