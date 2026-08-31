"use client";

import { useMemo } from "react";
import Link from "next/link";
import { scholarships, scholarshipVersions } from "@/data/scholarships";
import { useProfile } from "@/lib/profile-context";
import { computeAllEligibility } from "@/lib/eligibility";
import AuthLayout from "@/components/layout/AuthLayout";
import Badge from "@/components/ui/Badge";
import {
  Radar,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Search,
} from "lucide-react";

export default function RadarPage() {
  return (
    <AuthLayout>
      <RadarContent />
    </AuthLayout>
  );
}

function RadarContent() {
  const { profile } = useProfile();

  const results = useMemo(() => {
    if (!profile) return [];
    return computeAllEligibility(
      profile,
      scholarships.filter((s) => s.isActive)
    );
  }, [profile]);

  // New matches (eligible or high match)
  const newMatches = useMemo(
    () =>
      results.filter(
        (r) =>
          r.result.verdict === "eligible" || r.result.matchScore >= 70
      ),
    [results]
  );

  // Closing soon (within 30 days)
  const closingSoon = useMemo(() => {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return scholarships
      .filter((s) => {
        const deadline = new Date(s.deadline).getTime();
        return s.isActive && deadline > now && deadline - now < thirtyDays;
      })
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
  }, []);

  // Recently changed
  const recentlyChanged = scholarshipVersions;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          <Radar className="h-7 w-7 text-emerald-600" />
          Scholarship Radar
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your system is watching supported sources for you.
        </p>
      </div>

      {/* New Matches */}
      <RadarSection
        icon={<Sparkles className="h-5 w-5" />}
        title="New matches"
        description="Scholarships matching your profile"
        count={newMatches.length}
        emptyMessage="No new matches found. Try updating your profile."
      >
        {newMatches.slice(0, 5).map(({ scholarship, result }) => (
          <Link
            key={scholarship.id}
            href={`/scholarships/${scholarship.id}`}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
              {result.matchScore}%
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                {scholarship.name}
              </h3>
              <p className="text-xs text-slate-500">{scholarship.provider}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-600" />
          </Link>
        ))}
      </RadarSection>

      {/* Closing Soon */}
      <RadarSection
        icon={<Clock className="h-5 w-5" />}
        title="Closing soon"
        description="Scholarships with approaching deadlines"
        count={closingSoon.length}
        emptyMessage="No scholarships closing within 30 days."
      >
        {closingSoon.map((scholarship) => {
          const daysLeft = Math.max(
            0,
            Math.ceil(
              (new Date(scholarship.deadline).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          );
          return (
            <Link
              key={scholarship.id}
              href={`/scholarships/${scholarship.id}`}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                  daysLeft <= 7
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {daysLeft}d
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                  {scholarship.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Deadline:{" "}
                  {new Date(scholarship.deadline).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-600" />
            </Link>
          );
        })}
      </RadarSection>

      {/* Recently Changed */}
      <RadarSection
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Recently changed"
        description="Scholarship criteria that have been updated"
        count={recentlyChanged.length}
        emptyMessage="No recent changes detected."
      >
        {recentlyChanged.map((change) => {
          const scholarship = scholarships.find(
            (s) => s.id === change.scholarshipId
          );
          if (!scholarship) return null;
          return (
            <Link
              key={change.id}
              href={`/scholarships/${scholarship.id}`}
              className="group flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                  {scholarship.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {change.changeDescription}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Changed on{" "}
                  {new Date(change.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Badge variant="warning">Updated</Badge>
            </Link>
          );
        })}
      </RadarSection>

      {/* Source Status */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Search className="h-5 w-5 text-slate-400" />
          Monitoring Status
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          ScholarLens monitors the following verified sources:
        </p>
        <div className="mt-4 space-y-3">
          <SourceRow
            name="National Scholarship Portal (NSP)"
            url="https://scholarships.gov.in/"
            status="monitoring"
          />
          <SourceRow
            name="Ministry of Education"
            url="https://www.education.gov.in/scholarship-and-fellowships-students"
            status="monitoring"
          />
          <SourceRow
            name="ICICI Foundation"
            url="https://www.icicifoundation.org/scholarships"
            status="monitoring"
          />
          <SourceRow
            name="Tata Trusts"
            url="https://www.tatatrusts.org/our-work/education/scholarships"
            status="monitoring"
          />
          <SourceRow
            name="Reliance Foundation"
            url="https://www.reliancefoundation.org/initiative/scholarship"
            status="monitoring"
          />
        </div>
        <p className="mt-4 text-xs text-slate-400">
          ScholarLens respects robots.txt and does not scrape protected content.
        </p>
      </div>
    </div>
  );
}

function RadarSection({
  icon,
  title,
  description,
  count,
  emptyMessage,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
        <div className="text-emerald-600">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <Badge variant="default">{count}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {count > 0 ? children : (
          <p className="py-8 text-center text-sm text-slate-400">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}

function SourceRow({
  name,
  url,
  status,
}: {
  name: string;
  url: string;
  status: "monitoring" | "error" | "paused";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            status === "monitoring"
              ? "bg-emerald-500"
              : status === "error"
              ? "bg-red-500"
              : "bg-amber-500"
          }`}
        />
        <span className="text-sm font-medium text-slate-700">{name}</span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-emerald-600 hover:text-emerald-700"
      >
        View source →
      </a>
    </div>
  );
}
