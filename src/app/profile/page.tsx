"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { StudentProfile, CourseType, YearOfStudy, InstitutionType, IncomeRange, CasteCategory, Gender } from "@/lib/types";
import AuthLayout from "@/components/layout/AuthLayout";
import Badge from "@/components/ui/Badge";
import {
  User,
  BookOpen,
  MapPin,
  GraduationCap,
  TrendingUp,
  Shield,
  Edit3,
  LogOut,
  ExternalLink,
  Info,
} from "lucide-react";

const COURSE_LABELS: Record<CourseType, string> = {
  btech: "B.Tech / B.E.", bca: "BCA", bsc: "B.Sc", ba: "BA", bcom: "B.Com",
  mbbs: "MBBS", llb: "LLB", bpharm: "B.Pharm", diploma: "Diploma", ma: "MA",
  mca: "MCA", mtech: "M.Tech", msc: "M.Sc", mba: "MBA", phd: "PhD", other: "Other",
};

const YEAR_LABELS: Record<YearOfStudy, string> = {
  "1": "1st Year", "2": "2nd Year", "3": "3rd Year", "4": "4th Year",
  "5": "5th Year", pg: "PG (Master's)", phd: "PhD",
};

const INSTITUTION_LABELS: Record<InstitutionType, string> = {
  government: "Government", aided: "Aided (Govt. grant)", private: "Private",
  deemed: "Deemed University", "open-university": "Open University", other: "Other",
};

const INCOME_LABELS: Record<IncomeRange, string> = {
  "below-1l": "Below ₹1L", "1l-2.5l": "₹1–2.5L", "2.5l-5l": "₹2.5–5L",
  "5l-8l": "₹5–8L", "8l-12l": "₹8–12L", "above-12l": "Above ₹12L",
  "prefer-not-to-say": "Prefer not to say",
};

const CASTE_LABELS: Record<CasteCategory, string> = {
  general: "General", ews: "EWS", obc: "OBC", sc: "SC", st: "ST",
  other: "Other", "prefer-not-to-say": "Prefer not to say",
};

const GENDER_LABELS: Record<Gender, string> = {
  male: "Male", female: "Female", other: "Other", "prefer-not-to-say": "Prefer not to say",
};

export default function ProfilePage() {
  return (
    <AuthLayout>
      <ProfileContent />
    </AuthLayout>
  );
}

function ProfileContent() {
  const { user, signOut, isDemoMode } = useAuth();
  const { profile, readiness, updateProfile } = useProfile();
  const [editingField, setEditingField] = useState<string | null>(null);
  const router = useRouter();

  const profileFields = [
    { key: "course", label: "Course", icon: BookOpen, value: profile?.course ? COURSE_LABELS[profile.course] : null },
    { key: "year", label: "Year", icon: GraduationCap, value: profile?.year ? YEAR_LABELS[profile.year] : null },
    { key: "state", label: "State", icon: MapPin, value: profile?.state },
    { key: "institutionType", label: "Institution", icon: BuildingIcon, value: profile?.institutionType ? INSTITUTION_LABELS[profile.institutionType] : null },
    { key: "percentage", label: "Academic Score", icon: TrendingUp, value: profile?.percentage ? `${profile.percentage}%` : null },
    { key: "incomeRange", label: "Family Income", icon: TrendingUp, value: profile?.incomeRange ? INCOME_LABELS[profile.incomeRange] : null, sensitive: true },
    { key: "casteCategory", label: "Caste Category", icon: Shield, value: profile?.casteCategory ? CASTE_LABELS[profile.casteCategory] : null, sensitive: true },
    { key: "gender", label: "Gender", icon: User, value: profile?.gender ? GENDER_LABELS[profile.gender] : null },
  ];

  const filledCount = profileFields.filter((f) => f.value).length;
  const totalCount = profileFields.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          <User className="h-7 w-7 text-emerald-600" />
          Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your Student DNA profile.
        </p>
      </div>

      {/* Profile Readiness */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Scholarship readiness
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filledCount} of {totalCount} profile fields completed
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-600">{readiness}%</p>
            <p className="text-xs text-slate-400">readiness</p>
          </div>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${readiness}%` }}
          />
        </div>
        {readiness < 70 && (
          <p className="mt-3 text-xs text-slate-500">
            Complete your profile to improve matching accuracy.
          </p>
        )}
      </div>

      {/* Student DNA Fields */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-semibold text-slate-900">Student DNA</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {profileFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <field.icon className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{field.label}</p>
                  {field.sensitive && (
                    <p className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Info className="h-3 w-3" />
                      Used for eligibility matching only
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {field.value ? (
                  <Badge variant="info">{field.value}</Badge>
                ) : (
                  <Badge variant="default">Not set</Badge>
                )}
                <button
                  onClick={() => router.push("/onboarding")}
                  className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  title="Edit"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Shield className="h-5 w-5 text-slate-400" />
          Privacy
        </h2>
        <div className="mt-3 space-y-2 text-sm text-slate-500">
          <p>
            Your ScholarLens profile is separate from your Google account.
            We store only what you provide for eligibility matching.
          </p>
          <p>
            We do not store Aadhaar, PAN, bank accounts, OTPs, or government
            portal credentials.
          </p>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-700"
          >
            Privacy policy
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Account */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Account</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-500">
          <p>
            <span className="font-medium text-slate-700">Signed in as:</span>{" "}
            {user?.email ?? "Demo user"}
          </p>
          {isDemoMode && (
            <p className="text-xs text-amber-500">
              Running in demo mode. Data is stored locally in your browser.
            </p>
          )}
        </div>
        <button
          onClick={() => signOut()}
          className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      {/* Links */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/privacy" className="text-slate-400 hover:text-slate-600">
          Privacy policy
        </Link>
        <Link href="/about" className="text-slate-400 hover:text-slate-600">
          About ScholarLens
        </Link>
      </div>
    </div>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
