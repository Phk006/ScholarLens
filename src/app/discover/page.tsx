"use client";

import { useState, useMemo, Suspense, lazy } from "react";
import Link from "next/link";
import { scholarships } from "@/data/scholarships";
import { useProfile } from "@/lib/profile-context";
import { computeAllEligibility } from "@/lib/eligibility";
import { Scholarship, VerificationStatus } from "@/lib/types";
import AuthLayout from "@/components/layout/AuthLayout";
import Badge from "@/components/ui/Badge";
import { Search, Clock, IndianRupee, ArrowRight, Filter, Globe, LayoutGrid } from "lucide-react";

const ScholarshipUniverse = lazy(() => import("@/components/three/ScholarshipUniverse"));

export default function DiscoverPage() {
  return (
    <AuthLayout>
      <DiscoverContent />
    </AuthLayout>
  );
}

function DiscoverContent() {
  const { profile } = useProfile();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "universe">("grid");

  // Compute eligibility for all scholarships
  const results = useMemo(() => {
    if (!profile) return [];
    return computeAllEligibility(
      profile,
      scholarships.filter((s) => s.isActive)
    );
  }, [profile]);

  // Filter by search query and type
  const filtered = useMemo(() => {
    let list = results;
    if (typeFilter !== "all") {
      list = list.filter((r) => r.scholarship.providerType === typeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.scholarship.name.toLowerCase().includes(q) ||
          r.scholarship.provider.toLowerCase().includes(q) ||
          r.scholarship.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.scholarship.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [results, query, typeFilter]);

  const typeFilters = [
    { value: "all", label: "All" },
    { value: "government", label: "Government" },
    { value: "csr", label: "CSR" },
    { value: "foundation", label: "Foundation" },
    { value: "state-government", label: "State" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Discover Scholarships
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {filtered.length} scholarship{filtered.length !== 1 ? "s" : ""} found
          {profile?.course
            ? ` for ${profile.course.toUpperCase()} students`
            : ""}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scholarships, providers, or keywords…"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="flex gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                typeFilter === f.value
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* View toggle */}
      {filtered.length > 0 && (
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              viewMode === "grid"
                ? "bg-slate-900 text-white"
                : "border border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            onClick={() => setViewMode("universe")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              viewMode === "universe"
                ? "bg-slate-900 text-white"
                : "border border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Universe
          </button>
        </div>
      )}

      {/* 3D Universe View */}
      {viewMode === "universe" && filtered.length > 0 && (
        <div className="mb-6">
          <Suspense
            fallback={
              <div className="flex h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                  <p className="mt-2 text-xs text-slate-400">Loading 3D view…</p>
                </div>
              </div>
            }
          >
            <ScholarshipUniverse
              scholarships={filtered.map((r) => ({
                name: r.scholarship.name,
                id: r.scholarship.id,
                score: r.result.matchScore,
              }))}
            />
          </Suspense>
        </div>
      )}

      {/* Scholarship Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Filter className="mx-auto h-12 w-12 text-slate-200" />
          <p className="mt-4 text-lg font-medium text-slate-500">No scholarships found</p>
          <p className="mt-1 text-sm text-slate-400">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ scholarship, result }) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              matchScore={result.matchScore}
              verdict={result.verdict}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ScholarshipCard({
  scholarship,
  matchScore,
  verdict,
}: {
  scholarship: Scholarship;
  matchScore: number;
  verdict: string;
}) {
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const urgencyColor =
    daysLeft <= 7 ? "text-red-600" : daysLeft <= 30 ? "text-amber-600" : "text-slate-500";

  const verdictBadge = () => {
    switch (verdict) {
      case "eligible":
        return <Badge variant="success">Likely eligible</Badge>;
      case "not-eligible":
        return <Badge variant="danger">Not a match</Badge>;
      case "needs-verification":
        return <Badge variant="warning">Check eligibility</Badge>;
      default:
        return null;
    }
  };

  return (
    <Link
      href={`/scholarships/${scholarship.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-200 hover:shadow-md"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {verdictBadge()}
            <VerificationBadge status={scholarship.verificationStatus} />
          </div>
          <h3 className="mt-2 text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700">
            {scholarship.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {scholarship.provider}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1">
            <span className="text-sm font-bold text-emerald-700">{matchScore}%</span>
          </div>
          <span className="text-[10px] text-slate-400">match</span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-2">
        {scholarship.description}
      </p>

      {/* Bottom row */}
      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <IndianRupee className="h-3 w-3" />
            {scholarship.amountDisplay}
          </div>
          <div className={`flex items-center gap-1 text-xs ${urgencyColor}`}>
            <Clock className="h-3 w-3" />
            {daysLeft > 0 ? `${daysLeft} days` : "Expired"}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-600" />
      </div>
    </Link>
  );
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  switch (status) {
    case "verified":
      return <Badge variant="verified">✓ Verified</Badge>;
    case "needs-verification":
      return <Badge variant="warning">⚠ Needs verification</Badge>;
    case "demo":
      return <Badge variant="demo">Demo</Badge>;
    case "unverified":
      return <Badge variant="danger">Unverified</Badge>;
  }
}
