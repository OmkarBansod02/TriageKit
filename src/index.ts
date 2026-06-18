import { Command, InvalidArgumentError } from "commander";
import { RequestError } from "@octokit/request-error";

import { detectPackageChanges } from "./analysis/detectPackageChanges.js";
import { getPullRequestFiles } from "./github/getPullRequestFiles.js";
import { getPullRequests } from "./github/getPullRequests.js";
import { runRules } from "./rules/runRules.js";
import { scorePullRequest } from "./scoring/scorePullRequest.js";
import type { PullRequestFileSummary, PullRequestMetadata, RepositorySlug } from "./github/types.js";
import type { RuleResult, RuleStatus } from "./rules/types.js";
import type { TriageClassification, TriageScore } from "./scoring/types.js";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const program = new Command();

function parseRepositorySlug(value: string): RepositorySlug {
  const parts = value.split("/");

  if (parts.length !== 2 || parts.some((part) => part.trim() === "")) {
    throw new InvalidArgumentError(
      "Repository must use the format owner/repo, for example corsairdev/corsair.",
    );
  }

  return {
    owner: parts[0],
    repo: parts[1],
  };
}

function parseLimit(value: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_LIMIT) {
    throw new InvalidArgumentError(`Limit must be an integer from 1 to ${MAX_LIMIT}.`);
  }

  return parsed;
}

function formatDate(value: string): string {
  return new Date(value).toISOString();
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "none";
}

function printPullRequestMetadata(pullRequest: PullRequestMetadata): void {
  console.log(`#${pullRequest.number} ${pullRequest.title}`);
  console.log(`Author: ${pullRequest.authorLogin}`);
  console.log(`Draft: ${pullRequest.draft ? "yes" : "no"}`);
  console.log(`State: ${pullRequest.state}`);
  console.log(`URL: ${pullRequest.htmlUrl}`);
  console.log(`Created: ${formatDate(pullRequest.createdAt)}`);
  console.log(`Updated: ${formatDate(pullRequest.updatedAt)}`);
}

function printFileSummary(summary: PullRequestFileSummary): void {
  console.log(`Files changed: ${summary.totalFilesChanged}`);
  console.log(`Additions: ${summary.totalAdditions}`);
  console.log(`Deletions: ${summary.totalDeletions}`);
  console.log(`Package roots: ${formatList(summary.packageRoots)}`);
  console.log(`Detected packages: ${formatList(summary.detectedPackageNames)}`);
  console.log(`Touches demo/testing: ${summary.touchesDemoTesting ? "yes" : "no"}`);
  console.log(`Touches core: ${summary.touchesCore ? "yes" : "no"}`);
}

function statusIcon(status: RuleStatus): string {
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

function printRuleResults(results: RuleResult[]): void {
  console.log("Rules:");

  for (const result of results) {
    console.log(`${statusIcon(result.status)} ${result.label}: ${result.reason}`);
  }
}

function formatClassification(classification: TriageClassification): string {
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

function printListSection(label: string, items: string[]): void {
  console.log(`${label}:`);

  if (items.length === 0) {
    console.log("- none");
    return;
  }

  for (const item of items) {
    console.log(`- ${item}`);
  }
}

function printTriageScore(score: TriageScore, options: { breakdown: boolean }): void {
  console.log(`Score: ${score.score}/${score.maxScore}`);
  console.log(`Classification: ${formatClassification(score.classification)}`);
  console.log(`Founder action: ${score.founderAction}`);
  printListSection("Blockers", score.blockers);
  printListSection("Risk signals", score.riskSignals);

  if (options.breakdown) {
    console.log("Breakdown:");

    for (const item of score.breakdown) {
      console.log(`- ${item.label}: ${item.points}/${item.maxPoints}`);
    }
  }
}

async function printPullRequests(
  repository: RepositorySlug,
  pullRequests: PullRequestMetadata[],
  options: { token?: string; files: boolean; rules: boolean; breakdown: boolean },
): Promise<void> {
  if (pullRequests.length === 0) {
    console.log("No open pull requests found.");
    return;
  }

  for (const pullRequest of pullRequests) {
    printPullRequestMetadata(pullRequest);

    try {
      const changedFiles = await getPullRequestFiles({
        ...repository,
        pullNumber: pullRequest.number,
        token: options.token,
      });
      const summary = detectPackageChanges(changedFiles);

      printFileSummary(summary);

      if (options.rules) {
        const ruleResults = runRules({
          pullRequest,
          changedFiles,
          summary,
        });

        printRuleResults(ruleResults);
        printTriageScore(scorePullRequest(ruleResults), {
          breakdown: options.breakdown,
        });
      }

      if (options.files) {
        console.log("Changed files:");
        for (const file of changedFiles) {
          console.log(`- ${file.filename}`);
        }
      }
    } catch (error) {
      if (error instanceof RequestError) {
        console.warn(
          `Warning: could not fetch changed files for PR #${pullRequest.number}: ${describeGitHubError(
            error,
          )}`,
        );
      } else {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Warning: could not fetch changed files for PR #${pullRequest.number}: ${message}`);
      }
    }

    console.log("");
  }
}

function isRateLimitError(error: RequestError): boolean {
  const remaining = error.response?.headers["x-ratelimit-remaining"];
  return error.status === 403 && remaining === "0";
}

function describeGitHubError(error: RequestError): string {
  if (isRateLimitError(error)) {
    const resetSeconds = error.response?.headers["x-ratelimit-reset"];
    const resetAt = resetSeconds
      ? new Date(Number(resetSeconds) * 1000).toISOString()
      : "an unknown time";

    return `GitHub API rate limit exceeded. Try again after ${resetAt}. Set GITHUB_TOKEN to increase the rate limit for public repository reads.`;
  }

  if (error.status === 404) {
    return "GitHub repository not found, or it is not publicly accessible.";
  }

  return `GitHub API error (${error.status}): ${error.message}`;
}

function printGitHubError(error: RequestError): void {
  console.error(describeGitHubError(error));
}

program
  .name("triagekit")
  .description("Read-only pull request triage metadata for maintainers.")
  .version("0.1.0");

program
  .command("repo")
  .description("Fetch open pull requests for a public GitHub repository.")
  .argument("<repository>", "GitHub repository in owner/repo format", parseRepositorySlug)
  .option("-l, --limit <count>", "maximum number of pull requests to fetch", parseLimit, DEFAULT_LIMIT)
  .option("--files", "print changed file paths for each pull request")
  .option("--no-rules", "do not print readiness rule results")
  .option("--breakdown", "print full score breakdown")
  .option("--no-breakdown", "do not print full score breakdown")
  .action(
    async (
      repository: RepositorySlug,
      options: { limit: number; files: boolean; rules: boolean; breakdown?: boolean },
    ) => {
    try {
      const token = process.env.GITHUB_TOKEN;
      const pullRequests = await getPullRequests({
        ...repository,
        limit: options.limit,
        token,
      });

      await printPullRequests(repository, pullRequests, {
        token,
        files: options.files,
        rules: options.rules,
        breakdown: options.breakdown === true,
      });
    } catch (error) {
      if (error instanceof RequestError) {
        printGitHubError(error);
        process.exitCode = 1;
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      console.error(`Unexpected error: ${message}`);
      process.exitCode = 1;
    }
  },
  );

program.parseAsync(process.argv);
