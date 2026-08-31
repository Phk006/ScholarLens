import {
  StudentProfile,
  Scholarship,
  ScholarshipRule,
  EligibilityResult,
  EligibilityVerdict,
  RuleResult,
  IncomeRange,
} from "./types";

// =============================================================================
// Income range ordering (for comparisons)
// =============================================================================

const INCOME_ORDER: Record<IncomeRange, number> = {
  "below-1l": 100_000,
  "1l-2.5l": 250_000,
  "2.5l-5l": 500_000,
  "5l-8l": 800_000,
  "8l-12l": 1_200_000,
  "above-12l": 1_500_000,
  "prefer-not-to-say": 9_999_999,
};

function incomeToNumber(range: IncomeRange): number {
  return INCOME_ORDER[range] ?? 9_999_999;
}

function incomeLabel(range: IncomeRange): string {
  const labels: Record<IncomeRange, string> = {
    "below-1l": "Below ₹1L",
    "1l-2.5l": "₹1–2.5L",
    "2.5l-5l": "₹2.5–5L",
    "5l-8l": "₹5–8L",
    "8l-12l": "₹8–12L",
    "above-12l": "Above ₹12L",
    "prefer-not-to-say": "Not specified",
  };
  return labels[range] ?? "Unknown";
}

// =============================================================================
// Rule evaluator
// =============================================================================

function evaluateRule(
  rule: ScholarshipRule,
  profile: StudentProfile
): RuleResult {
  const profileValue = (profile as unknown as Record<string, unknown>)[rule.field];
  const profileStr = formatProfileValue(rule.field, profileValue);

  const requiredStr = formatRequiredValue(rule);

  const result: RuleResult = {
    field: rule.field,
    label: rule.label,
    passed: false,
    failed: false,
    uncertain: false,
    studentValue: profileStr,
    requiredValue: requiredStr,
    explanation: rule.explanation,
  };

  // If the profile doesn't have this value, it's uncertain
  if (profileValue === null || profileValue === undefined) {
    result.uncertain = true;
    return result;
  }

  switch (rule.operator) {
    case "equals": {
      result.passed = profileValue === rule.value;
      break;
    }
    case "in": {
      const arr = rule.value as unknown[];
      result.passed = arr.includes(profileValue);
      break;
    }
    case "not-in": {
      const arr = rule.value as unknown[];
      result.passed = !arr.includes(profileValue);
      break;
    }
    case "gte": {
      const numVal = Number(rule.value);
      if (rule.field === "percentage") {
        result.passed = (profileValue as number) >= numVal;
      } else if (rule.field === "incomeRange") {
        result.passed = incomeToNumber(profileValue as IncomeRange) <= numVal;
      } else {
        result.passed = Number(profileValue) >= numVal;
      }
      break;
    }
    case "lte": {
      const numVal = Number(rule.value);
      if (rule.field === "incomeRange") {
        result.passed = incomeToNumber(profileValue as IncomeRange) <= numVal;
      } else {
        result.passed = Number(profileValue) <= numVal;
      }
      break;
    }
    case "between": {
      const [min, max] = rule.value as [number, number];
      result.passed = Number(profileValue) >= min && Number(profileValue) <= max;
      break;
    }
    case "contains": {
      const arr = rule.value as unknown[];
      result.passed = arr.includes(profileValue);
      break;
    }
  }

  result.failed = !result.passed && !result.uncertain;
  return result;
}

// =============================================================================
// Format helpers
// =============================================================================

function formatProfileValue(field: string, value: unknown): string {
  if (value === null || value === undefined) return "Not provided";
  if (field === "incomeRange") return incomeLabel(value as IncomeRange);
  if (field === "percentage") return `${value}%`;
  if (field === "minorityStatus" || field === "isSingleGirlChild" || field === "isKashmirMigrant") {
    return value === true ? "Yes" : "No";
  }
  return String(value);
}

function formatRequiredValue(rule: ScholarshipRule): string {
  switch (rule.operator) {
    case "equals":
      return String(rule.value);
    case "in":
      return (rule.value as unknown[]).join(", ");
    case "not-in":
      return `Not one of: ${(rule.value as unknown[]).join(", ")}`;
    case "gte":
      if (rule.field === "incomeRange") return `≤ ₹${incomeLabel(rule.value as IncomeRange)}`;
      if (rule.field === "percentage") return `≥ ${rule.value}%`;
      return `≥ ${rule.value}`;
    case "lte":
      if (rule.field === "incomeRange") return `≤ ${incomeLabel(rule.value as IncomeRange)}`;
      return `≤ ${rule.value}`;
    case "between":
      return `Between ${(rule.value as [number, number])[0]} and ${(rule.value as [number, number])[1]}`;
    default:
      return String(rule.value);
  }
}

// =============================================================================
// Main eligibility computation
// =============================================================================

export function computeEligibility(
  profile: StudentProfile,
  scholarship: Scholarship
): EligibilityResult {
  const ruleResults = scholarship.eligibilityRules.map((rule) =>
    evaluateRule(rule, profile)
  );

  const mandatoryRules = ruleResults.filter(
    (_, i) => scholarship.eligibilityRules[i].mandatory
  );
  const optionalRules = ruleResults.filter(
    (_, i) => !scholarship.eligibilityRules[i].mandatory
  );

  const mandatoryFailed = mandatoryRules.some((r) => r.failed);
  const mandatoryUncertain = mandatoryRules.some((r) => r.uncertain);
  const allPassed = ruleResults.every((r) => r.passed);

  let verdict: EligibilityVerdict;
  if (mandatoryFailed) {
    verdict = "not-eligible";
  } else if (mandatoryUncertain || !allPassed) {
    verdict = "needs-verification";
  } else {
    verdict = "eligible";
  }

  // Calculate match score
  let score = 0;
  let totalWeight = 0;
  for (let i = 0; i < ruleResults.length; i++) {
    const weight = scholarship.eligibilityRules[i].mandatory ? 2 : 1;
    totalWeight += weight;
    if (ruleResults[i].passed) score += weight;
    else if (ruleResults[i].uncertain) score += weight * 0.3;
  }
  const matchScore = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;

  return {
    id: `elig-${profile.uid}-${scholarship.id}`,
    uid: profile.uid,
    scholarshipId: scholarship.id,
    verdict,
    matchScore,
    ruleResults,
    computedAt: new Date().toISOString(),
  };
}

// =============================================================================
// Batch computation
// =============================================================================

export function computeAllEligibility(
  profile: StudentProfile,
  scholarships: Scholarship[]
): { scholarship: Scholarship; result: EligibilityResult }[] {
  return scholarships
    .map((s) => ({
      scholarship: s,
      result: computeEligibility(profile, s),
    }))
    .sort((a, b) => b.result.matchScore - a.result.matchScore);
}

// =============================================================================
// Immediate refusal reason
// =============================================================================

export function getRefusalReason(
  result: EligibilityResult
): RuleResult | null {
  if (result.verdict !== "not-eligible") return null;
  return result.ruleResults.find((r) => r.failed) ?? null;
}

// =============================================================================
// Get better matches (eligible or near-eligible alternatives)
// =============================================================================

export function getBetterMatches(
  currentId: string,
  allResults: { scholarship: Scholarship; result: EligibilityResult }[],
  maxResults = 3
): { scholarship: Scholarship; result: EligibilityResult }[] {
  return allResults
    .filter(
      (r) =>
        r.scholarship.id !== currentId &&
        (r.result.verdict === "eligible" || r.result.matchScore >= 70)
    )
    .slice(0, maxResults);
}
