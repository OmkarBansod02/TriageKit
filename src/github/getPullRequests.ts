import { Octokit } from "@octokit/rest";

import type { PullRequestMetadata, RepositorySlug } from "./types.js";

interface GetPullRequestsOptions extends RepositorySlug {
  limit: number;
  token?: string;
}

export async function getPullRequests({
  owner,
  repo,
  limit,
  token,
}: GetPullRequestsOptions): Promise<PullRequestMetadata[]> {
  const octokit = new Octokit({
    auth: token,
  });

  const response = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    sort: "updated",
    direction: "desc",
    per_page: limit,
  });

  return response.data.map((pullRequest) => ({
    number: pullRequest.number,
    title: pullRequest.title,
    body: pullRequest.body ?? "",
    authorLogin: pullRequest.user?.login ?? "unknown",
    draft: pullRequest.draft ?? false,
    state: pullRequest.state,
    htmlUrl: pullRequest.html_url,
    createdAt: pullRequest.created_at,
    updatedAt: pullRequest.updated_at,
  }));
}
