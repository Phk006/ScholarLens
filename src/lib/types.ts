// =============================================================================
// ScholarLens — Complete Type System
// =============================================================================

// ---------------------------------------------------------------------------
// Profile / Student DNA
// ---------------------------------------------------------------------------

export type CourseType =
  | "btech"
  | "bca"
  | "bsc"
  | "diploma"
  | "mbbs"
  | "ba"
  | "bcom"
  | "llb"
  | "bpharm"
  | "ma"
  | "mca"
  | "mtech"
  | "msc"
  | "mba"
  | "phd"
  | "other";

export type YearOfStudy = "1" | "2" | "3" | "4" | "5" | "pg" | "phd";

export type InstitutionType =
  | "government"
  | "private"
  | "deemed"
  | "aided"
  | "open-university"
  | "other";

export type IncomeRange =
  | "below-1l"
  | "1l-2.5l"
  | "2.5l-5l"
  | "5l-8l"
  | "8l-12l"
  | "above-12l"
  | "prefer-not-to-say";

export type CasteCategory =
  | "general"
  | "obc"
  | "sc"
  | "st"
  | "ews"
  | "other"
  | "prefer-not-to-say";

export type Gender = "male" | "female" | "other" | "prefer-not-to-say";

export type DisabilityStatus = "yes" | "no" | "prefer-not-to-say";

export type InstitutionOwnership = "central" | "state" | "private" | "deemed" | "other";

export interface StudentProfile {
  uid: string;
  course: CourseType | null;
  year: YearOfStudy | null;
  state: string | null;
  institutionType: InstitutionType | null;
  institutionName: string | null;
  institutionOwnership: InstitutionOwnership | null;
  percentage: number | null;
  incomeRange: IncomeRange | null;
  casteCategory: CasteCategory | null;
  gender: Gender | null;
  disabilityStatus: DisabilityStatus | null;
  minorityStatus: boolean | null;
  isSingleGirlChild: boolean | null;
  isKashmirMigrant: boolean | null;
  completedSteps: string[];
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Scholarship
// ---------------------------------------------------------------------------

export type ScholarshipCategory =
  | "government"
  | "private"
  | "csr"
  | "foundation"
  | "university"
  | "state-government";

export type VerificationStatus =
  | "verified"
  | "needs-verification"
  | "unverified"
  | "demo";

export interface ScholarshipRule {
  field: string;
  label: string;
  operator:
    | "equals"
    | "in"
    | "not-in"
    | "gte"
    | "lte"
    | "between"
    | "contains";
  value: unknown;
  mandatory: boolean;
  explanation: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  providerType: ScholarshipCategory;
  description: string;
  amount: number | string;
  amountDisplay: string;
  deadline: string;
  eligibilityRules: ScholarshipRule[];
  documentsRequired: string[];
  applicationProcess: string[];
  sourceUrl: string;
  applicationUrl: string;
  sourceAuthority: string;
  lastVerifiedAt: string;
  verificationStatus: VerificationStatus;
  tags: string[];
  courseTypes: CourseType[];
  states: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Change detection
  previousVersionId?: string;
}

export interface ScholarshipVersion {
  id: string;
  scholarshipId: string;
  version: number;
  data: Partial<Scholarship>;
  changedFields: string[];
  createdAt: string;
  changeDescription: string;
}

// ---------------------------------------------------------------------------
// Eligibility
// ---------------------------------------------------------------------------

export type EligibilityVerdict = "eligible" | "not-eligible" | "needs-verification";

export interface RuleResult {
  field: string;
  label: string;
  passed: boolean;
  failed: boolean;
  uncertain: boolean;
  studentValue: string;
  requiredValue: string;
  explanation: string;
}

export interface EligibilityResult {
  id: string;
  uid: string;
  scholarshipId: string;
  verdict: EligibilityVerdict;
  matchScore: number;
  ruleResults: RuleResult[];
  computedAt: string;
}

// ---------------------------------------------------------------------------
// Saved / Application Tracking
// ---------------------------------------------------------------------------

export type ApplicationStatus =
  | "saved"
  | "preparing"
  | "documents-pending"
  | "applied"
  | "submitted"
  | "closed";

export interface SavedScholarship {
  uid: string;
  scholarshipId: string;
  savedAt: string;
}

export interface Application {
  id: string;
  uid: string;
  scholarshipId: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  uid: string;
  type: "deadline" | "change" | "new-match" | "eligibility-change";
  title: string;
  body: string;
  scholarshipId?: string;
  read: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface UserRecord {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
}
