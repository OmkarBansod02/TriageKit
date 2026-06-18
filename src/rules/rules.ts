import type { PullRequestFile } from "../github/types.js";
import type { ReadinessRule, RuleContext, RuleResult, RuleStatus } from "./types.js";

const KNOWN_CORE_PACKAGES = new Set(["corsair", "cli", "studio", "mcp", "db", "api"]);

const CLEAR_ISSUE_PATTERN = /\b(fixes|closes|resolves|related|issue)\s+#\d+\b/i;
const LOOSE_ISSUE_PATTERN = /#\d+\b/;

const TYPE_SCRIPT_RISK_PATTERNS = [
  "as any",
  "as unknown as",
  "@ts-ignore",
  "@ts-expect-error",
  "Record<string, any>",
  ": any",
  "any[]",
];

const DESCRIPTION_TERMS = [
  "testing",
  "test",
  "auth",
  "webhook",
  "schema",
  "endpoint",
  "integration",
  "plugin",
  "demo",
  "pnpm",
  "typecheck",
  "build",
];

const TEST_PROOF_PATTERNS = [
  /\bpnpm\b/i,
  /\bnpm test\b/i,
  /\btypecheck\b/i,
  /\bbuild\b/i,
  /\bdemo\/testing\b/i,
  /\bscreenshot\b/i,
  /\bloom\b/i,
  /\blogs?\b/i,
];

const AUTH_WEBHOOK_PATTERNS = [
  /\bauth\b/i,
  /\bapi key\b/i,
  /\boauth\b/i,
  /\btoken\b/i,
  /\bwebhook\b/i,
  /\bsignature\b/i,
  /\bschema\b/i,
  /\bendpoint\b/i,
];

const AUTH_WEBHOOK_STRONG_PATTERNS = [
  /\bauth\b/i,
  /\bapi key\b/i,
  /\boauth\b/i,
  /\btoken\b/i,
  /\bwebhook\b/i,
  /\bsignature\b/i,
];

const EXPECTED_CORE_TOUCH_PATHS = new Set([
  "packages/corsair/core/constants.ts",
  "pnpm-lock.yaml",
  "package.json",
  "pnpm-workspace.yaml",
]);

const RISKY_CORE_PREFIXES = [
  "packages/corsair/client/",
  "packages/corsair/server/",
  "packages/cli/",
  "packages/studio/",
  "packages/mcp/",
  "packages/db/",
  "packages/api/",
  "apps/",
];

function combinedPrText(context: RuleContext): string {
  return `${context.pullRequest.title}\n${context.pullRequest.body}`;
}

function isRiskyCorsairCorePath(filename: string): boolean {
  return filename.startsWith("packages/corsair/core/") && filename !== "packages/corsair/core/constants.ts";
}

function isRiskyCorePath(filename: string): boolean {
  return RISKY_CORE_PREFIXES.some((prefix) => filename.startsWith(prefix)) || isRiskyCorsairCorePath(filename);
}

function isPluginIntegrationPr(context: RuleContext): boolean {
  const title = context.pullRequest.title.toLowerCase();

  return (
    title.includes("plugin") ||
    title.includes("integration") ||
    context.summary.detectedPackageNames.some((name) => !KNOWN_CORE_PACKAGES.has(name))
  );
}

function uniqueMatchedTerms(text: string, terms: string[]): string[] {
  const lowerText = text.toLowerCase();

  return terms.filter((term) => lowerText.includes(term));
}

function countPatchPatternOccurrences(files: PullRequestFile[]): { count: number; examples: string[] } {
  const examples = new Set<string>();
  let count = 0;

  for (const file of files) {
    const patch = file.patch ?? "";

    for (const pattern of TYPE_SCRIPT_RISK_PATTERNS) {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = patch.match(new RegExp(escapedPattern, "g"));

      if (matches) {
        count += matches.length;
        examples.add(pattern);
      }
    }
  }

  return {
    count,
    examples: [...examples].slice(0, 3),
  };
}

function makeResult(id: string, label: string, status: RuleStatus, reason: string): RuleResult {
  return {
    id,
    label,
    status,
    reason,
  };
}

export const draftPrRule: ReadinessRule = ({ pullRequest }) => {
  if (pullRequest.draft) {
    return makeResult("draft-pr", "Draft PR", "warning", "PR is marked as draft");
  }

  return makeResult("draft-pr", "Draft PR", "pass", "PR is not a draft");
};

export const linkedIssueRule: ReadinessRule = (context) => {
  const text = combinedPrText(context);
  const clearMatch = text.match(CLEAR_ISSUE_PATTERN);

  if (clearMatch) {
    return makeResult("linked-issue", "Linked issue", "pass", `Found "${clearMatch[0]}"`);
  }

  const looseMatch = text.match(LOOSE_ISSUE_PATTERN);

  if (looseMatch) {
    return makeResult("linked-issue", "Linked issue", "warning", `Found loose reference "${looseMatch[0]}"`);
  }

  return makeResult("linked-issue", "Linked issue", "fail", "No linked issue reference found");
};

export const packageDetectedRule: ReadinessRule = ({ summary }) => {
  const packageNames =
    summary.detectedPackageNames.length > 0 ? summary.detectedPackageNames.join(", ") : "none";

  if (summary.packageRoots.length > 0) {
    return makeResult("package-detected", "Package detected", "pass", `Detected packages: ${packageNames}`);
  }

  return makeResult("package-detected", "Package detected", "warning", `Detected packages: ${packageNames}`);
};

export const demoTestingRule: ReadinessRule = (context) => {
  if (!isPluginIntegrationPr(context)) {
    return makeResult("demo-testing", "Demo/testing", "unknown", "not required for non-plugin PR");
  }

  if (context.summary.touchesDemoTesting) {
    return makeResult("demo-testing", "Demo/testing", "pass", "Plugin PR updates demo/testing");
  }

  return makeResult("demo-testing", "Demo/testing", "fail", "Plugin PR but demo/testing not updated");
};

export const coreTouchRule: ReadinessRule = ({ changedFiles, summary }) => {
  if (!summary.touchesCore) {
    return makeResult("core-touch", "Core touch", "pass", "No core/framework areas touched");
  }

  const coreTouchedFiles = changedFiles.filter(
    (file) => EXPECTED_CORE_TOUCH_PATHS.has(file.filename) || isRiskyCorePath(file.filename),
  );
  const riskyFiles = coreTouchedFiles.filter((file) => isRiskyCorePath(file.filename));

  if (riskyFiles.length === 0) {
    return makeResult(
      "core-touch",
      "Core touch",
      "warning",
      "Only expected registration/config core paths touched",
    );
  }

  if (riskyFiles.length > 5) {
    return makeResult(
      "core-touch",
      "Core touch",
      "fail",
      `${riskyFiles.length} risky core/framework files touched`,
    );
  }

  return makeResult(
    "core-touch",
    "Core touch",
    "warning",
    `${riskyFiles.length} risky core/framework file(s) touched`,
  );
};

export const sizeRiskRule: ReadinessRule = ({ summary }) => {
  const reason = `${summary.totalFilesChanged} files, ${summary.totalAdditions} additions, ${summary.totalDeletions} deletions`;

  if (summary.totalFilesChanged > 50 || summary.totalAdditions > 2500) {
    return makeResult("size-risk", "Size risk", "fail", reason);
  }

  if (summary.totalFilesChanged <= 15 && summary.totalAdditions <= 1000) {
    return makeResult("size-risk", "Size risk", "pass", reason);
  }

  return makeResult("size-risk", "Size risk", "warning", reason);
};

export const unsafeTypeScriptRule: ReadinessRule = ({ changedFiles }) => {
  const { count, examples } = countPatchPatternOccurrences(changedFiles);

  if (count === 0) {
    return makeResult("unsafe-typescript", "Unsafe TypeScript", "pass", "No risky TypeScript patterns found");
  }

  const reason = `${count} occurrence(s) found: ${examples.join(", ")}`;

  if (count > 3) {
    return makeResult("unsafe-typescript", "Unsafe TypeScript", "fail", reason);
  }

  return makeResult("unsafe-typescript", "Unsafe TypeScript", "warning", reason);
};

export const prDescriptionRule: ReadinessRule = ({ pullRequest }) => {
  const body = pullRequest.body.trim();

  if (body.length < 30) {
    return makeResult("pr-description", "PR description", "fail", "Description is empty or very short");
  }

  if (body.length < 150) {
    return makeResult("pr-description", "PR description", "warning", "Description is under 150 characters");
  }

  const matchedTerms = uniqueMatchedTerms(body, DESCRIPTION_TERMS);

  if (matchedTerms.length >= 2) {
    return makeResult("pr-description", "PR description", "pass", `Mentions useful terms: ${matchedTerms.join(", ")}`);
  }

  return makeResult("pr-description", "PR description", "warning", "Description lacks enough implementation detail terms");
};

export const testProofRule: ReadinessRule = ({ pullRequest }) => {
  const body = pullRequest.body;
  const hasClearProof = TEST_PROOF_PATTERNS.some((pattern) => pattern.test(body));
  const hasGenericTestedOnly = /\btested\b/i.test(body);

  if (hasClearProof) {
    return makeResult("test-proof", "Test proof", "pass", "PR body includes testing proof");
  }

  if (hasGenericTestedOnly) {
    return makeResult("test-proof", "Test proof", "warning", 'Only generic "tested" proof found');
  }

  return makeResult("test-proof", "Test proof", "fail", "No test proof found in PR body");
};

export const authWebhookNotesRule: ReadinessRule = (context) => {
  if (!isPluginIntegrationPr(context)) {
    return makeResult("auth-webhook-notes", "Auth/webhook notes", "unknown", "not required for non-plugin PR");
  }

  const searchableText = [
    context.pullRequest.body,
    ...context.changedFiles.map((file) => file.filename),
  ].join("\n");
  const matchedTerms = AUTH_WEBHOOK_PATTERNS.filter((pattern) => pattern.test(searchableText));
  const hasStrongAuthWebhookSignal = AUTH_WEBHOOK_STRONG_PATTERNS.some((pattern) => pattern.test(searchableText));

  if (hasStrongAuthWebhookSignal) {
    return makeResult("auth-webhook-notes", "Auth/webhook notes", "pass", "Auth/webhook-related notes or paths found");
  }

  if (matchedTerms.length > 0) {
    return makeResult(
      "auth-webhook-notes",
      "Auth/webhook notes",
      "warning",
      "Endpoint/schema signal found, but no auth or webhook signal",
    );
  }

  return makeResult(
    "auth-webhook-notes",
    "Auth/webhook notes",
    "fail",
    "No auth, webhook, schema, or endpoint signal found",
  );
};

export const readinessRules: ReadinessRule[] = [
  draftPrRule,
  linkedIssueRule,
  packageDetectedRule,
  demoTestingRule,
  coreTouchRule,
  sizeRiskRule,
  unsafeTypeScriptRule,
  prDescriptionRule,
  testProofRule,
  authWebhookNotesRule,
];
