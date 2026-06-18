import type { PullRequestFile, PullRequestFileSummary, PullRequestMetadata } from "../github/types.js";

export type RuleStatus = "pass" | "fail" | "warning" | "unknown";

export interface RuleResult {
  id: string;
  label: string;
  status: RuleStatus;
  reason: string;
}

export interface RuleContext {
  pullRequest: PullRequestMetadata;
  changedFiles: PullRequestFile[];
  summary: PullRequestFileSummary;
}

export type ReadinessRule = (context: RuleContext) => RuleResult;
