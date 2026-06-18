import {
  CLASSIFICATION_ORDER,
  createClassificationCounts,
  formatClassification,
  formatList,
  formatRuleResult,
  formatYesNo,
  suggestedContributorComment,
} from "./formatters.js";
import type { AnalyzedPullRequest, TriageReport } from "./types.js";

const KEY_RULE_IDS = new Set(["linked-issue", "demo-testing", "test-proof", "auth-webhook-notes"]);

function bulletList(items: string[]): string[] {
  if (items.length === 0) {
    return ["* none"];
  }

  return items.map((item) => `* ${item}`);
}

function prHeading(item: AnalyzedPullRequest): string {
  return `#${item.pullRequest.number} ${item.pullRequest.title}`;
}

function shortAuthorAction(item: AnalyzedPullRequest): string {
  const firstBlocker = item.triageScore.blockers[0];

  if (firstBlocker) {
    switch (firstBlocker) {
      case "PR is still draft":
        return "PR is still draft";
      case "No linked issue found":
        return "no linked issue found";
      case "No package/change scope detected":
        return "no package/change scope detected";
      case "Plugin/integration PR missing demo/testing update":
        return "missing demo/testing update";
      case "PR description too weak":
        return "PR description too weak";
      case "No test proof found":
        return "no test proof found";
      default:
        return firstBlocker;
    }
  }

  return item.triageScore.founderAction;
}

function renderPrCard(item: AnalyzedPullRequest): string[] {
  const keyRules = item.ruleResults.filter((result) => KEY_RULE_IDS.has(result.id));

  return [
    `### ${prHeading(item)}`,
    "",
    `* Author: ${item.pullRequest.authorLogin}`,
    `* URL: ${item.pullRequest.htmlUrl}`,
    `* Score: ${item.triageScore.score}/${item.triageScore.maxScore}`,
    `* Classification: ${formatClassification(item.triageScore.classification)}`,
    `* Files changed: ${item.summary.totalFilesChanged}`,
    `* Additions/deletions: +${item.summary.totalAdditions} / -${item.summary.totalDeletions}`,
    `* Detected packages: ${formatList(item.summary.detectedPackageNames)}`,
    `* Touches demo/testing: ${formatYesNo(item.summary.touchesDemoTesting)}`,
    `* Touches core: ${formatYesNo(item.summary.touchesCore)}`,
    "",
    "Founder action:",
    item.triageScore.founderAction,
    "",
    "Blockers:",
    "",
    ...bulletList(item.triageScore.blockers),
    "",
    "Risk signals:",
    "",
    ...bulletList(item.triageScore.riskSignals),
    "",
    "Key rule results:",
    "",
    ...bulletList(keyRules.map(formatRuleResult)),
    "",
    "Suggested contributor comment:",
    suggestedContributorComment(item),
    "",
  ];
}

function renderUrgentAuthorActions(pullRequests: AnalyzedPullRequest[]): string[] {
  const items = pullRequests
    .filter((item) => item.triageScore.blockers.length > 0)
    .sort((a, b) => b.triageScore.score - a.triageScore.score);

  if (items.length === 0) {
    return ["* none"];
  }

  return items.map((item) => `* ${prHeading(item)} — ${shortAuthorAction(item)}`);
}

function renderHighestRiskPullRequests(pullRequests: AnalyzedPullRequest[]): string[] {
  const items = pullRequests
    .filter((item) => item.triageScore.riskSignals.length >= 2 || item.triageScore.score < 50)
    .sort((a, b) => {
      const riskCountDifference = b.triageScore.riskSignals.length - a.triageScore.riskSignals.length;
      return riskCountDifference !== 0 ? riskCountDifference : a.triageScore.score - b.triageScore.score;
    });

  if (items.length === 0) {
    return ["* none"];
  }

  return items.map(
    (item) =>
      `* ${prHeading(item)} — ${item.triageScore.score}/${item.triageScore.maxScore}, ${item.triageScore.riskSignals.length} risk signal(s)`,
  );
}

export function generateMarkdownReport(report: TriageReport): string {
  const counts = createClassificationCounts(report.pullRequests);
  const lines: string[] = [
    "# TriageKit PR Readiness Report",
    "",
    "This report helps maintainers decide which PRs are worth deep review first and which need contributor follow-up.",
    "",
    `* Repository: ${report.repository}`,
    `* Generated at: ${report.generatedAt}`,
    `* PRs scanned: ${report.pullRequests.length}`,
    '* Note: "This is a triage signal, not a merge decision."',
    "",
    "| Bucket | Count |",
    "| ------------------------ | ----: |",
    ...CLASSIFICATION_ORDER.map(
      (classification) =>
        `| ${formatClassification(classification)} | ${counts[classification].toString().padStart(5, " ")} |`,
    ),
    "",
    "## How to use this report",
    "",
    '* Start with "Ready for founder review"',
    '* Send suggested comments for "Needs author action"',
    '* Review "Risky / broad" separately because they may touch framework/core paths',
    "* Treat scores as prioritization signals, not correctness guarantees",
    "",
    "## PRs needing author action",
    "",
    ...renderUrgentAuthorActions(report.pullRequests),
    "",
    "## Highest-risk PRs",
    "",
    ...renderHighestRiskPullRequests(report.pullRequests),
    "",
  ];

  for (const classification of CLASSIFICATION_ORDER) {
    const items = report.pullRequests.filter(
      (item) => item.triageScore.classification === classification,
    );

    lines.push(`## ${formatClassification(classification)}`, "");

    if (items.length === 0) {
      lines.push("_No PRs in this bucket._", "");
      continue;
    }

    for (const item of items) {
      lines.push(...renderPrCard(item));
    }
  }

  lines.push(
    "## Limitations",
    "",
    "* Does not verify code correctness",
    "* Does not replace CI, Greptile, or human review",
    "* Does not run untrusted PR code",
    "* Does not comment or label PRs",
    "* Some rules are heuristic and should be tuned with maintainer feedback",
    "",
  );

  return `${lines.join("\n").trimEnd()}\n`;
}
