import { Command, InvalidArgumentError } from "commander";
import { RequestError } from "@octokit/request-error";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { detectPackageChanges } from "./analysis/detectPackageChanges.js";
import { getPullRequestFiles } from "./github/getPullRequestFiles.js";
import { getPullRequests } from "./github/getPullRequests.js";
import {
  createClassificationCounts,
  formatClassification,
  formatList,
  formatRuleResult,
  formatYesNo,
} from "./report/formatters.js";
import { generateMarkdownReport } from "./report/generateMarkdownReport.js";
import { runRules } from "./rules/runRules.js";
import { scorePullRequest } from "./scoring/scorePullRequest.js";
import type { PullRequestFileSummary, PullRequestMetadata, RepositorySlug } from "./github/types.js";
import type { AnalyzedPullRequest } from "./report/types.js";
import type { RuleResult } from "./rules/types.js";
import type { TriageScore } from "./scoring/types.js";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_REPORT_PATH = "reports/triage-report.md";

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
  console.log(`Touches demo/testing: ${formatYesNo(summary.touchesDemoTesting)}`);
  console.log(`Touches core: ${formatYesNo(summary.touchesCore)}`);
}

function printRuleResults(results: RuleResult[]): void {
  console.log("Rules:");

  for (const result of results) {
    console.log(formatRuleResult(result));
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

async function analyzePullRequest(
  repository: RepositorySlug,
  pullRequest: PullRequestMetadata,
  options: { token?: string },
): Promise<AnalyzedPullRequest> {
  const changedFiles = await getPullRequestFiles({
    ...repository,
    pullNumber: pullRequest.number,
    token: options.token,
  });
  const summary = detectPackageChanges(changedFiles);
  const ruleResults = runRules({
    pullRequest,
    changedFiles,
    summary,
  });
  const triageScore = scorePullRequest(ruleResults);

  return {
    pullRequest,
    changedFiles,
    summary,
    ruleResults,
    triageScore,
  };
}

async function analyzePullRequests(
  repository: RepositorySlug,
  pullRequests: PullRequestMetadata[],
  options: { token?: string },
): Promise<AnalyzedPullRequest[]> {
  const analyzedPullRequests: AnalyzedPullRequest[] = [];

  for (const pullRequest of pullRequests) {
    try {
      analyzedPullRequests.push(await analyzePullRequest(repository, pullRequest, options));
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
  }

  return analyzedPullRequests;
}

function printPullRequests(
  analyzedPullRequests: AnalyzedPullRequest[],
  options: { files: boolean; rules: boolean; breakdown: boolean },
): void {
  if (analyzedPullRequests.length === 0) {
    console.log("No open pull requests found.");
    return;
  }

  for (const analyzedPullRequest of analyzedPullRequests) {
    printPullRequestMetadata(analyzedPullRequest.pullRequest);
    printFileSummary(analyzedPullRequest.summary);

    if (options.rules) {
      printRuleResults(analyzedPullRequest.ruleResults);
      printTriageScore(analyzedPullRequest.triageScore, {
        breakdown: options.breakdown,
      });
    }

    if (options.files) {
      console.log("Changed files:");
      for (const file of analyzedPullRequest.changedFiles) {
        console.log(`- ${file.filename}`);
      }
    }

    console.log("");
  }
}

async function writeReport(
  repository: string,
  reportPath: string,
  pullRequests: AnalyzedPullRequest[],
): Promise<void> {
  const markdown = generateMarkdownReport({
    repository,
    generatedAt: new Date().toISOString(),
    pullRequests,
  });

  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, markdown, "utf8");
}

function printReportSummary(reportPath: string, pullRequests: AnalyzedPullRequest[]): void {
  const counts = createClassificationCounts(pullRequests);

  console.log(`Report written to ${reportPath}`);
  console.log("Open it with:");
  console.log(`code ${reportPath}`);
  console.log(`PRs scanned: ${pullRequests.length}`);
  console.log("Counts per bucket:");

  for (const [classification, count] of Object.entries(counts)) {
    console.log(`- ${formatClassification(classification as keyof typeof counts)}: ${count}`);
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
  .option("--report", "write a markdown triage report")
  .option("--report-path <path>", "path for markdown triage report", DEFAULT_REPORT_PATH)
  .action(
    async (
      repository: RepositorySlug,
      options: {
        limit: number;
        files: boolean;
        rules: boolean;
        breakdown?: boolean;
        report: boolean;
        reportPath: string;
      },
    ) => {
    try {
      const token = process.env.GITHUB_TOKEN;
      const pullRequests = await getPullRequests({
        ...repository,
        limit: options.limit,
        token,
      });

      const analyzedPullRequests = await analyzePullRequests(repository, pullRequests, {
        token,
      });

      if (options.report) {
        const repositoryName = `${repository.owner}/${repository.repo}`;
        await writeReport(repositoryName, options.reportPath, analyzedPullRequests);
        printReportSummary(options.reportPath, analyzedPullRequests);
        return;
      }

      printPullRequests(analyzedPullRequests, {
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
