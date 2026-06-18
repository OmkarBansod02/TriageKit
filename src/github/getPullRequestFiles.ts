import { Octokit } from "@octokit/rest";

import type { PullRequestFile, RepositorySlug } from "./types.js";

interface GetPullRequestFilesOptions extends RepositorySlug {
  pullNumber: number;
  token?: string;
}

export async function getPullRequestFiles({
  owner,
  repo,
  pullNumber,
  token,
}: GetPullRequestFilesOptions): Promise<PullRequestFile[]> {
  const octokit = new Octokit({
    auth: token,
  });

  const files = await octokit.paginate(octokit.pulls.listFiles, {
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  return files.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch,
  }));
}
