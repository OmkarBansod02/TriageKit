import { Command, InvalidArgumentError } from "commander";
import { RequestError } from "@octokit/request-error";

import { getPullRequests } from "./github/getPullRequests.js";
import type { PullRequestMetadata, RepositorySlug } from "./github/types.js";

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

function printPullRequests(pullRequests: PullRequestMetadata[]): void {
  if (pullRequests.length === 0) {
    console.log("No open pull requests found.");
    return;
  }

  for (const pullRequest of pullRequests) {
    console.log(`#${pullRequest.number} ${pullRequest.title}`);
    console.log(`Author: ${pullRequest.authorLogin}`);
    console.log(`Draft: ${pullRequest.draft ? "yes" : "no"}`);
    console.log(`State: ${pullRequest.state}`);
    console.log(`URL: ${pullRequest.htmlUrl}`);
    console.log(`Created: ${formatDate(pullRequest.createdAt)}`);
    console.log(`Updated: ${formatDate(pullRequest.updatedAt)}`);
    console.log("");
  }
}

function isRateLimitError(error: RequestError): boolean {
  const remaining = error.response?.headers["x-ratelimit-remaining"];
  return error.status === 403 && remaining === "0";
}

function printGitHubError(error: RequestError): void {
  if (isRateLimitError(error)) {
    const resetSeconds = error.response?.headers["x-ratelimit-reset"];
    const resetAt = resetSeconds
      ? new Date(Number(resetSeconds) * 1000).toISOString()
      : "an unknown time";

    console.error(`GitHub API rate limit exceeded. Try again after ${resetAt}.`);
    console.error("Set GITHUB_TOKEN to increase the rate limit for public repository reads.");
    return;
  }

  if (error.status === 404) {
    console.error("GitHub repository not found, or it is not publicly accessible.");
    return;
  }

  console.error(`GitHub API error (${error.status}): ${error.message}`);
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
  .action(async (repository: RepositorySlug, options: { limit: number }) => {
    try {
      const pullRequests = await getPullRequests({
        ...repository,
        limit: options.limit,
        token: process.env.GITHUB_TOKEN,
      });

      printPullRequests(pullRequests);
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
  });

program.parseAsync(process.argv);
