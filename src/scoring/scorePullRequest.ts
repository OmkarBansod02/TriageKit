import type { RuleResult, RuleStatus } from "../rules/types.js";
import { classifyPullRequest, founderActionForClassification } from "./classifyPullRequest.js";
import type { ScoreBreakdownItem, TriageScore } from "./types.js";

const RULE_WEIGHTS: Record<string, number> = {
  "draft-pr": 5,
  "linked-issue": 15,
  "package-detected": 10,
  "demo-testing": 15,
  "core-touch": 10,
  "size-risk": 10,
  "unsafe-typescript": 10,
  "pr-description": 10,
  "test-proof": 10,
  "auth-webhook-notes": 5,
};

const MAX_SCORE = Object.values(RULE_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

function pointsForStatus(status: RuleStatus, maxPoints: number): number {
  switch (status) {
    case "pass":
    case "unknown":
      return maxPoints;
    case "warning":
      return Math.floor(maxPoints / 2);
    case "fail":
      return 0;
  }
}

function blockerForRule(result: RuleResult): string | undefined {
  switch (result.id) {
    case "draft-pr":
      return result.status === "warning" ? "PR is still draft" : undefined;
    case "linked-issue":
      return result.status === "fail" ? "No linked issue found" : undefined;
    case "package-detected":
      return result.status === "warning" || result.status === "fail"
        ? "No package/change scope detected"
        : undefined;
    case "demo-testing":
      return result.status === "fail" ? "Plugin/integration PR missing demo/testing update" : undefined;
    case "pr-description":
      return result.status === "fail" ? "PR description too weak" : undefined;
    case "test-proof":
      return result.status === "fail" ? "No test proof found" : undefined;
    default:
      return undefined;
  }
}

function riskSignalForRule(result: RuleResult): string | undefined {
  const isRiskStatus = result.status === "warning" || result.status === "fail";

  if (!isRiskStatus) {
    return undefined;
  }

  switch (result.id) {
    case "core-touch":
      return `Core touch: ${result.reason}`;
    case "size-risk":
      return `Large PR: ${result.reason}`;
    case "unsafe-typescript":
      return `Unsafe TypeScript: ${result.reason}`;
    case "auth-webhook-notes":
      return `Auth/webhook notes: ${result.reason}`;
    default:
      return undefined;
  }
}

export function scorePullRequest(ruleResults: RuleResult[]): TriageScore {
  const breakdown: ScoreBreakdownItem[] = ruleResults.map((result) => {
    const maxPoints = RULE_WEIGHTS[result.id] ?? 0;

    return {
      ruleId: result.id,
      label: result.label,
      points: pointsForStatus(result.status, maxPoints),
      maxPoints,
      reason: result.reason,
    };
  });

  const score = breakdown.reduce((sum, item) => sum + item.points, 0);
  const blockers = ruleResults.flatMap((result) => {
    const blocker = blockerForRule(result);
    return blocker ? [blocker] : [];
  });
  const riskSignals = ruleResults.flatMap((result) => {
    const riskSignal = riskSignalForRule(result);
    return riskSignal ? [riskSignal] : [];
  });
  const isDraft = ruleResults.some((result) => result.id === "draft-pr" && result.status === "warning");
  const classification = classifyPullRequest({
    score,
    blockers,
    riskSignals,
    isDraft,
  });

  return {
    score,
    maxScore: MAX_SCORE,
    percentage: Math.round((score / MAX_SCORE) * 100),
    classification,
    founderAction: founderActionForClassification(classification),
    blockers,
    riskSignals,
    breakdown,
  };
}
