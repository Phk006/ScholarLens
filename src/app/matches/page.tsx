"use client";

import { useMemo } from "react";
import Link from "next/link";
import { scholarships } from "@/data/scholarships";
import { useProfile } from "@/lib/profile-context";
import { computeAllEligibility } from "@/lib/eligibility";
import AuthLayout from "@/components/layout/AuthLayout";
import Badge from "@/components/ui/Badge";
import {
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  IndianRupee,
  Clock,
} from "lucide-react";

export default function MatchesPage() {
  return (
    <AuthLayout>
      <MatchesContent />
    </AuthLayout>
  );
}

function MatchesContent() {
  const { profile } = useProfile();

  const results = useMemo(() => {
    if (!profile) return [];
    return computeAllEligibility(
      profile,
      scholarships.filter((s) => s.isActive)
    );
  }, [profile]);

  const eligible = results.filter((r) => r.result.verdict === "eligible");
  const needsVerification = results.filter((r) => r.result.verdict === "needs-verification");
  const notEligible = results.filter((r) => r.result.verdict === "not-eligible");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          <Target className="h-7 w-7 text-emerald-600" />
          My Matches
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Scholarship eligibility based on your Student DNA profile.
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{eligible.length}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">Likely eligible</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{needsVerification.length}</p>
          <p className="mt-1 text-xs font-medium text-amber-600">Needs verification</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{notEligible.length}</p>
          <p className="mt-1 text-xs font-medium text-red-500">Not eligible</p>
        </div>
      </div>

      {/* Eligible */}
      {eligible.length > 0 && (
        <Section title="Likely eligible" color="emerald">
          {eligible.map(({ scholarship, result }) => (
            <MatchCard
              key={scholarship.id}
              scholarship={scholarship}
              matchScore={result.matchScore}
              verdict={result.verdict}
              passedCount={result.ruleResults.filter((r) => r.passed).length}
              totalCount={result.ruleResults.length}
            />
          ))}
        </Section>
      )}

      {/* Needs verification */}
      {needsVerification.length > 0 && (
        <Section title="Needs verification" color="amber">
          {needsVerification.map(({ scholarship, result }) => (
            <MatchCard
              key={scholarship.id}
              scholarship={scholarship}
              matchScore={result.matchScore}
              verdict={result.verdict}
              passedCount={result.ruleResults.filter((r) => r.passed).length}
              totalCount={result.ruleResults.length}
            />
          ))}
        </Section>
      )}

      {/* Not eligible */}
      {notEligible.length > 0 && (
        <Section title="Not eligible" color="red">
          {notEligible.map(({ scholarship, result }) => (
            <MatchCard
              key={scholarship.id}
              scholarship={scholarship}
              matchScore={result.matchScore}
              verdict={result.verdict}
              passedCount={result.ruleResults.filter((r) => r.passed).length}
              totalCount={result.ruleResults.length}
            />
          ))}
        </Section>
      )}

      {results.length === 0 && (
        <div className="py-20 text-center">
          <Target className="mx-auto h-12 w-12 text-slate-200" />
          <p className="mt-4 text-lg font-medium text-slate-500">No matches yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Complete your Student DNA to see scholarship matches.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Complete profile
          </Link>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function MatchCard({
  scholarship,
  matchScore,
  verdict,
  passedCount,
  totalCount,
}: {
  scholarship: { id: string; name: string; provider: string; amountDisplay: string; deadline: string };
  matchScore: number;
  verdict: string;
  passedCount: number;
  totalCount: number;
}) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const verdictIcon =
    verdict === "eligible" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    ) : verdict === "not-eligible" ? (
      <XCircle className="h-4 w-4 text-red-500" />
    ) : (
      <HelpCircle className="h-4 w-4 text-amber-500" />
    );

  return (
    <Link
      href={`/scholarships/${scholarship.id}`}
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm"
    >
      {verdictIcon}
      <div className="flex-1 min-w-0">
        <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
          {scholarship.name}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">{scholarship.provider}</p>
      </div>
      <div className="hidden items-center gap-4 sm:flex">
        <div className="text-xs text-slate-500">
          {passedCount}/{totalCount} criteria
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <IndianRupee className="h-3 w-3" />
          {scholarship.amountDisplay}
        </div>
        <div className={`text-xs ${daysLeft <= 7 ? "text-red-500" : "text-slate-400"}`}>
          {daysLeft}d left
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-emerald-700">{matchScore}%</span>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-600" />
      </div>
    </Link>
  );
}
