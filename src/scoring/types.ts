export type TriageClassification =
  | "ready_for_founder_review"
  | "almost_ready"
  | "needs_author_action"
  | "risky"
  | "not_ready";

export interface ScoreBreakdownItem {
  ruleId: string;
  label: string;
  points: number;
  maxPoints: number;
  reason: string;
}

export interface TriageScore {
  score: number;
  maxScore: number;
  percentage: number;
  classification: TriageClassification;
  founderAction: string;
  blockers: string[];
  riskSignals: string[];
  breakdown: ScoreBreakdownItem[];
}
