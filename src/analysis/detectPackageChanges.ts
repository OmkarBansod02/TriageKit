import type { PullRequestFile, PullRequestFileSummary } from "../github/types.js";

const PACKAGE_PATH_PATTERN = /^packages\/([^/]+)\//;

const CORE_PREFIXES = [
  "packages/corsair/",
  "packages/cli/",
  "packages/studio/",
  "packages/mcp/",
  "packages/db/",
  "packages/api/",
  "apps/",
];

export function detectPackageChanges(files: PullRequestFile[]): PullRequestFileSummary {
  const packageNames = new Set<string>();

  let totalAdditions = 0;
  let totalDeletions = 0;
  let touchesDemoTesting = false;
  let touchesCore = false;

  for (const file of files) {
    totalAdditions += file.additions;
    totalDeletions += file.deletions;

    const packageMatch = file.filename.match(PACKAGE_PATH_PATTERN);

    if (packageMatch) {
      packageNames.add(packageMatch[1]);
    }

    if (file.filename.startsWith("demo/testing/")) {
      touchesDemoTesting = true;
    }

    if (CORE_PREFIXES.some((prefix) => file.filename.startsWith(prefix))) {
      touchesCore = true;
    }
  }

  const detectedPackageNames = [...packageNames].sort();

  return {
    packageRoots: detectedPackageNames.map((name) => `packages/${name}`),
    detectedPackageNames,
    touchesDemoTesting,
    touchesCore,
    totalFilesChanged: files.length,
    totalAdditions,
    totalDeletions,
  };
}
