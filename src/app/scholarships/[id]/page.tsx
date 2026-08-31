"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { scholarships } from "@/data/scholarships";
import { useProfile } from "@/lib/profile-context";
import { computeEligibility, getRefusalReason, getBetterMatches, computeAllEligibility } from "@/lib/eligibility";
import { Scholarship, RuleResult, EligibilityVerdict } from "@/lib/types";
import AuthLayout from "@/components/layout/AuthLayout";
import Badge from "@/components/ui/Badge";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  IndianRupee,
  FileText,
  Shield,
  AlertTriangle,
  Info,
  BookOpen,
} from "lucide-react";

export default function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AuthLayout>
      <DetailContent id={id} />
    </AuthLayout>
  );
}

function DetailContent({ id }: { id: string }) {
  const { profile } = useProfile();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");

  const scholarship = scholarships.find((s) => s.id === id);

  const eligibility = useMemo(() => {
    if (!profile || !scholarship) return null;
    return computeEligibility(profile, scholarship);
  }, [profile, scholarship]);

  const allResults = useMemo(() => {
    if (!profile) return [];
    return computeAllEligibility(profile, scholarships.filter((s) => s.isActive));
  }, [profile]);

  const betterMatches = useMemo(() => {
    if (!eligibility) return [];
    return getBetterMatches(id, allResults, 3);
  }, [id, allResults, eligibility]);

  if (!scholarship) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Scholarship not found</h1>
        <p className="mt-2 text-slate-500">This scholarship may have been removed or the link is incorrect.</p>
        <Link href="/discover" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Back to Discover
        </Link>
      </div>
    );
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleApplyClick = (url: string) => {
    setPendingUrl(url);
    setShowLeaveConfirm(true);
  };

  const confirmLeave = () => {
    window.open(pendingUrl, "_blank", "noopener,noreferrer");
    setShowLeaveConfirm(false);
    setPendingUrl("");
  };

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/discover"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Discover
        </Link>

        {/* Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <VerificationStatusBadge status={scholarship.verificationStatus} />
                <Badge variant="default">{scholarship.providerType}</Badge>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                {scholarship.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{scholarship.provider}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {eligibility && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
                  eligibility.verdict === "eligible"
                    ? "bg-emerald-50"
                    : eligibility.verdict === "not-eligible"
                    ? "bg-red-50"
                    : "bg-amber-50"
                }`}>
                  <span className={`text-2xl font-bold ${
                    eligibility.verdict === "eligible"
                      ? "text-emerald-700"
                      : eligibility.verdict === "not-eligible"
                      ? "text-red-700"
                      : "text-amber-700"
                  }`}>
                    {eligibility.matchScore}%
                  </span>
                  <span className="text-xs text-slate-500">match</span>
                </div>
              )}
              <VerdictBadge verdict={eligibility?.verdict ?? "needs-verification"} />
            </div>
          </div>

          {/* Key info */}
          <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">{scholarship.amountDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className={`text-sm font-medium ${daysLeft <= 7 ? "text-red-600" : daysLeft <= 30 ? "text-amber-600" : "text-slate-700"}`}>
                {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-500">
                {scholarship.eligibilityRules.length} eligibility criteria
              </span>
            </div>
          </div>
        </div>

        {/* Immediate Refusal or Success */}
        {eligibility && (
          <div className={`mt-6 rounded-xl border p-6 ${
            eligibility.verdict === "eligible"
              ? "border-emerald-200 bg-emerald-50"
              : eligibility.verdict === "not-eligible"
              ? "border-red-200 bg-red-50"
              : "border-amber-200 bg-amber-50"
          }`}>
            {eligibility.verdict === "not-eligible" ? (
              <ImmediateRefusal result={eligibility} scholarship={scholarship} />
            ) : eligibility.verdict === "eligible" ? (
              <ImmediateSuccess result={eligibility} />
            ) : (
              <NeedsVerification result={eligibility} />
            )}
          </div>
        )}

        {/* Explanation: Why you're seeing this */}
        {eligibility && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Info className="h-5 w-5 text-blue-600" />
              Why you&apos;re seeing this
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              You match {eligibility.ruleResults.filter((r) => r.passed).length} of{" "}
              {eligibility.ruleResults.length} criteria.
            </p>
            <div className="mt-4 space-y-3">
              {eligibility.ruleResults.map((rule, i) => (
                <RuleRow key={i} rule={rule} />
              ))}
            </div>
          </div>
        )}

        {/* Overview */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {scholarship.description}
          </p>
        </div>

        {/* Documents Required */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Documents Required</h2>
          <ul className="mt-3 space-y-2">
            {scholarship.documentsRequired.map((doc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                {doc}
              </li>
            ))}
          </ul>
        </div>

        {/* Application Process */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Application Process</h2>
          <ol className="mt-3 space-y-3">
            {scholarship.applicationProcess.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Source */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Shield className="h-5 w-5 text-emerald-600" />
            Source
          </h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Source authority:</span>
              {scholarship.sourceAuthority}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Last verified:</span>
              {new Date(scholarship.lastVerifiedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <a
              href={scholarship.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-medium text-emerald-600 hover:text-emerald-700"
            >
              View official source
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Apply CTA */}
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            {eligibility?.verdict === "eligible"
              ? "You appear eligible based on the information provided."
              : eligibility?.verdict === "not-eligible"
              ? "You may not be eligible based on current information. Check before applying."
              : "Complete your eligibility check before applying."}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            ScholarLens does not submit applications. You&apos;ll be directed to the official portal.
          </p>
          <button
            onClick={() => handleApplyClick(scholarship.applicationUrl)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Continue to official portal
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Better Matches */}
        {betterMatches.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Better matches for you
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {betterMatches.map(({ scholarship: alt, result }) => (
                <Link
                  key={alt.id}
                  href={`/scholarships/${alt.id}`}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={result.verdict === "eligible" ? "success" : "warning"}>
                      {result.matchScore}% match
                    </Badge>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                    {alt.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">{alt.provider}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>{alt.amountDisplay}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
              <div>
                <h3 className="font-semibold text-slate-900">
                  You are leaving ScholarLens
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  You are about to visit the official application portal. ScholarLens does not
                  control the content of external websites.
                </p>
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 break-all">
                  {pendingUrl}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeave}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Open official portal →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RuleRow({ rule }: { rule: RuleResult }) {
  return (
    <div className="flex items-center gap-3">
      {rule.passed ? (
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
      ) : rule.failed ? (
        <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
      ) : (
        <HelpCircle className="h-4 w-4 flex-shrink-0 text-amber-500" />
      )}
      <div className="flex-1">
        <span className="text-sm font-medium text-slate-700">{rule.label}</span>
        <span className="text-sm text-slate-400"> — </span>
        <span className="text-sm text-slate-500">{rule.explanation}</span>
      </div>
      <span className={`text-xs font-medium ${
        rule.passed ? "text-emerald-600" : rule.failed ? "text-red-500" : "text-amber-500"
      }`}>
        {rule.studentValue}
      </span>
    </div>
  );
}

function ImmediateRefusal({
  result,
  scholarship,
}: {
  result: NonNullable<ReturnType<typeof computeEligibility>>;
  scholarship: Scholarship;
}) {
  const refusalReason = getRefusalReason(result);
  return (
    <div>
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-semibold text-red-700">Not a match</h3>
      </div>
      <p className="mt-2 text-sm text-red-600/80">
        Don&apos;t waste your application time. Here&apos;s what disqualified you:
      </p>
      {refusalReason && (
        <div className="mt-3 rounded-lg bg-white p-4">
          <p className="text-sm font-medium text-slate-700">
            {refusalReason.label}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Required: {refusalReason.requiredValue}
          </p>
          <p className="text-xs text-red-500">
            Your profile: {refusalReason.studentValue}
          </p>
        </div>
      )}
    </div>
  );
}

function ImmediateSuccess({ result }: { result: NonNullable<ReturnType<typeof computeEligibility>> }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-emerald-700">
          You appear eligible
        </h3>
      </div>
      <p className="mt-2 text-sm text-emerald-600/80">
        Based on your profile, you match all major criteria for this scholarship.
        This is not an official determination — verify all requirements before applying.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        {result.ruleResults.filter((r) => r.passed).length} of{" "}
        {result.ruleResults.length} criteria confirmed.
      </p>
    </div>
  );
}

function NeedsVerification({ result }: { result: NonNullable<ReturnType<typeof computeEligibility>> }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-amber-700">
          Needs verification
        </h3>
      </div>
      <p className="mt-2 text-sm text-amber-600/80">
        We couldn&apos;t fully verify your eligibility. Some information may be missing or
        requires official confirmation.
      </p>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: EligibilityVerdict }) {
  switch (verdict) {
    case "eligible":
      return <Badge variant="success">Likely eligible</Badge>;
    case "not-eligible":
      return <Badge variant="danger">Not eligible</Badge>;
    case "needs-verification":
      return <Badge variant="warning">Verify eligibility</Badge>;
  }
}

function VerificationStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "verified":
      return <Badge variant="verified">✓ Verified source</Badge>;
    case "needs-verification":
      return <Badge variant="warning">⚠ Needs verification</Badge>;
    case "demo":
      return <Badge variant="demo">Demo record</Badge>;
    case "unverified":
      return <Badge variant="danger">Unverified</Badge>;
    default:
      return null;
  }
}
