import type { TriageClassification } from "./types.js";

export interface ClassificationInput {
  score: number;
  blockers: string[];
  riskSignals: string[];
  isDraft: boolean;
}

export function classifyPullRequest({
  score,
  blockers,
  riskSignals,
  isDraft,
}: ClassificationInput): TriageClassification {
  if (isDraft) {
    return "not_ready";
  }

  if (score >= 85 && blockers.length === 0 && riskSignals.length <= 1) {
    return "ready_for_founder_review";
  }

  if (score >= 75 && blockers.length === 0) {
    return "almost_ready";
  }

  if (riskSignals.length >= 2 && score < 80) {
    return "risky";
  }

  if (blockers.length > 0) {
    return "needs_author_action";
  }

  return "needs_author_action";
}

export function founderActionForClassification(classification: TriageClassification): string {
  switch (classification) {
    case "ready_for_founder_review":
      return "Ready for maintainer review. Open this PR for deeper code/design review.";
    case "almost_ready":
      return "Almost ready. Review after checking the remaining warning signals.";
    case "needs_author_action":
      return "Ask the author to fix blockers before spending deep review time.";
    case "risky":
      return "Needs careful maintainer attention due to broad/risky changes before normal review.";
    case "not_ready":
      return "Do not review yet. Wait until the PR is no longer draft or basic readiness blockers are fixed.";
  }
}
