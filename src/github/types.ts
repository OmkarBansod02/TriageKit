export interface PullRequestMetadata {
  number: number;
  title: string;
  authorLogin: string;
  draft: boolean;
  state: string;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepositorySlug {
  owner: string;
  repo: string;
}
