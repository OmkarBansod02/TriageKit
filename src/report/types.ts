import type { PullRequestFile, PullRequestFileSummary, PullRequestMetadata } from "../github/types.js";
import type { RuleResult } from "../rules/types.js";
import type { TriageScore } from "../scoring/types.js";

export interface AnalyzedPullRequest {
  pullRequest: PullRequestMetadata;
  changedFiles: PullRequestFile[];
  summary: PullRequestFileSummary;
  ruleResults: RuleResult[];
  triageScore: TriageScore;
}

export interface TriageReport {
  repository: string;
  generatedAt: string;
  pullRequests: AnalyzedPullRequest[];
}
