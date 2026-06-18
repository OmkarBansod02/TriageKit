import type { RuleResult, RuleStatus } from "../rules/types.js";
import type { TriageClassification } from "../scoring/types.js";
import type { AnalyzedPullRequest } from "./types.js";

export const CLASSIFICATION_ORDER: TriageClassification[] = [
  "ready_for_founder_review",
  "almost_ready",
  "needs_author_action",
  "risky",
  "not_ready",
];

export function formatClassification(classification: TriageClassification): string {
  switch (classification) {
    case "ready_for_founder_review":
      return "Ready for founder review";
    case "almost_ready":
      return "Almost ready";
    case "needs_author_action":
      return "Needs author action";
    case "risky":
      return "Risky / broad";
    case "not_ready":
      return "Not ready";
  }
}

export function statusIcon(status: RuleStatus): string {
  switch (status) {
    case "pass":
      return "✅";
    case "fail":
      return "❌";
    case "warning":
      return "⚠️";
    case "unknown":
      return "➖";
  }
}

export function formatList(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "none";
}

export function formatYesNo(value: boolean): string {
  return value ? "yes" : "no";
}

export function createClassificationCounts(
  pullRequests: AnalyzedPullRequest[],
): Record<TriageClassification, number> {
  return CLASSIFICATION_ORDER.reduce(
    (counts, classification) => ({
      ...counts,
      [classification]: pullRequests.filter(
        (item) => item.triageScore.classification === classification,
      ).length,
    }),
    {
      ready_for_founder_review: 0,
      almost_ready: 0,
      needs_author_action: 0,
      risky: 0,
      not_ready: 0,
    },
  );
}

export function formatRuleResult(result: RuleResult): string {
  return `${statusIcon(result.status)} ${result.label}: ${result.reason}`;
}

export function suggestedContributorComment(item: AnalyzedPullRequest): string {
  const { blockers, riskSignals, classification } = item.triageScore;

  if (blockers.length > 0) {
    return `Thanks for the PR! Before this is ready for maintainer review, please fix: ${blockers
      .slice(0, 2)
      .join("; ")}. Once that's done, it should be much easier to review.`;
  }

  if (riskSignals.length > 0) {
    return `Thanks for the PR! This looks close, but maintainers may need to look carefully at: ${riskSignals
      .slice(0, 2)
      .join("; ")}.`;
  }

  if (classification === "ready_for_founder_review") {
    return "Thanks for the PR! Based on the automated triage checks, this looks ready for maintainer review.";
  }

  return "Thanks for the PR! Based on the automated triage checks, this looks ready for maintainer review.";
}
