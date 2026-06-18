export interface PullRequestMetadata {
  number: number;
  title: string;
  body: string;
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

export interface PullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface PullRequestFileSummary {
  packageRoots: string[];
  detectedPackageNames: string[];
  touchesDemoTesting: boolean;
  touchesCore: boolean;
  totalFilesChanged: number;
  totalAdditions: number;
  totalDeletions: number;
}
