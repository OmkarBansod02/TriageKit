import { readinessRules } from "./rules.js";
import type { RuleContext, RuleResult } from "./types.js";

export function runRules(context: RuleContext): RuleResult[] {
  return readinessRules.map((rule) => rule(context));
}
