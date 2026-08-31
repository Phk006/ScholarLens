"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { StudentProfile, CourseType, YearOfStudy, InstitutionType, IncomeRange, CasteCategory, Gender } from "@/lib/types";
import { ArrowRight, ArrowLeft, CheckCircle2, BookOpen } from "lucide-react";

const COURSE_OPTIONS: { value: CourseType; label: string }[] = [
  { value: "btech", label: "B.Tech / B.E." },
  { value: "bca", label: "BCA" },
  { value: "bsc", label: "B.Sc" },
  { value: "ba", label: "BA" },
  { value: "bcom", label: "B.Com" },
  { value: "mbbs", label: "MBBS" },
  { value: "llb", label: "LLB" },
  { value: "bpharm", label: "B.Pharm" },
  { value: "diploma", label: "Diploma" },
  { value: "ma", label: "MA" },
  { value: "mca", label: "MCA" },
  { value: "mtech", label: "M.Tech" },
  { value: "msc", label: "M.Sc" },
  { value: "mba", label: "MBA" },
  { value: "phd", label: "PhD" },
  { value: "other", label: "Other" },
];

const YEAR_OPTIONS: { value: YearOfStudy; label: string }[] = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year" },
  { value: "pg", label: "PG (Master's)" },
  { value: "phd", label: "PhD" },
];

const INSTITUTION_OPTIONS: { value: InstitutionType; label: string }[] = [
  { value: "government", label: "Government" },
  { value: "aided", label: "Aided (Govt. grant)" },
  { value: "private", label: "Private" },
  { value: "deemed", label: "Deemed University" },
  { value: "open-university", label: "Open University" },
  { value: "other", label: "Other" },
];

const INCOME_OPTIONS: { value: IncomeRange; label: string; detail: string }[] = [
  { value: "below-1l", label: "Below ₹1 Lakh", detail: "Annual family income" },
  { value: "1l-2.5l", label: "₹1 – 2.5 Lakh", detail: "Annual family income" },
  { value: "2.5l-5l", label: "₹2.5 – 5 Lakh", detail: "Annual family income" },
  { value: "5l-8l", label: "₹5 – 8 Lakh", detail: "Annual family income" },
  { value: "8l-12l", label: "₹8 – 12 Lakh", detail: "Annual family income" },
  { value: "above-12l", label: "Above ₹12 Lakh", detail: "Annual family income" },
  { value: "prefer-not-to-say", label: "Prefer not to say", detail: "May reduce matching accuracy" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry",
];

const PERCENTAGE_OPTIONS = [
  { value: 90, label: "90%+" },
  { value: 80, label: "80–89%" },
  { value: 70, label: "70–79%" },
  { value: 60, label: "60–69%" },
  { value: 50, label: "50–59%" },
  { value: 40, label: "Below 50%" },
];

const CASTE_OPTIONS: { value: CasteCategory; label: string }[] = [
  { value: "general", label: "General / Unreserved" },
  { value: "ews", label: "EWS" },
  { value: "obc", label: "OBC" },
  { value: "sc", label: "SC" },
  { value: "st", label: "ST" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

interface Step {
  id: string;
  question: string;
  why: string;
  field: keyof StudentProfile;
}

const STEPS: Step[] = [
  { id: "course", question: "What are you studying?", why: "Different scholarships target different courses.", field: "course" },
  { id: "year", question: "Which year are you in?", why: "Some scholarships are only for specific years.", field: "year" },
  { id: "state", question: "Where do you study?", why: "State-specific scholarships require this.", field: "state" },
  { id: "institution", question: "What type of institution?", why: "Government and aided institutions often have different eligibility.", field: "institutionType" },
  { id: "percentage", question: "How did you score last time?", why: "Many scholarships have academic cutoffs.", field: "percentage" },
  { id: "income", question: "What is your family income range?", why: "Need-based scholarships require this. Income-based matching significantly improves accuracy.", field: "incomeRange" },
  { id: "caste", question: "What is your caste category?", why: "Many government scholarships are category-specific (SC/ST/OBC/EWS).", field: "casteCategory" },
  { id: "gender", question: "Gender?", why: "Some scholarships are gender-specific (e.g., AICTE Pragati for girls).", field: "gender" },
];

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, updateProfile } = useProfile();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  const step = STEPS[currentStep];
  const progress = Math.round((completedSteps.length / STEPS.length) * 100);
  const currentValue = profile ? (profile as unknown as Record<string, unknown>)[step.field] : null;

  const handleSelect = (value: string | number | boolean) => {
    updateProfile({ [step.field]: value } as Partial<StudentProfile>);
    const newCompleted = [...new Set([...completedSteps, step.id])];
    setCompletedSteps(newCompleted);

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };

  const handleFinish = () => {
    updateProfile({ completedSteps: STEPS.map((s) => s.id), profileComplete: true });
    router.replace("/discover");
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">Student DNA</span>
          </div>
          <span className="text-sm font-medium text-slate-400">
            {completedSteps.length}/{STEPS.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 w-full bg-slate-100">
          <div
            className="h-full bg-emerald-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-lg">
          {/* Question */}
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {step.question}
          </h2>

          {/* Why */}
          <p className="mt-3 text-sm text-slate-500">
            <span className="font-medium text-slate-600">Why do we ask?</span>{" "}
            {step.why}
          </p>

          {/* Options */}
          <div className="mt-8 space-y-2">
            {step.id === "course" &&
              COURSE_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={currentValue === opt.value}
                  onClick={() => handleSelect(opt.value)}
                />
              ))}
            {step.id === "year" &&
              YEAR_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={currentValue === opt.value}
                  onClick={() => handleSelect(opt.value)}
                />
              ))}
            {step.id === "state" && (
              <select
                value={(currentValue as string) ?? ""}
                onChange={(e) => handleSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select your state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
            {step.id === "institution" &&
              INSTITUTION_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={currentValue === opt.value}
                  onClick={() => handleSelect(opt.value)}
                />
              ))}
            {step.id === "percentage" &&
              PERCENTAGE_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={currentValue === opt.value}
                  onClick={() => handleSelect(opt.value)}
                />
              ))}
            {step.id === "income" &&
              INCOME_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  detail={opt.detail}
                  selected={currentValue === opt.value}
                  onClick={() => handleSelect(opt.value)}
                />
              ))}
            {step.id === "caste" &&
              CASTE_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={currentValue === opt.value}
                  onClick={() => handleSelect(opt.value)}
                />
              ))}
            {step.id === "gender" &&
              GENDER_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={currentValue === opt.value}
                  onClick={() => handleSelect(opt.value)}
                />
              ))}
          </div>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-sm font-medium text-slate-400 transition hover:text-slate-600 disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {completedSteps.length === STEPS.length && (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Start Discovering
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Skip */}
          {currentStep < STEPS.length - 1 && (
            <div className="mt-6 text-center">
              <button
                onClick={handleFinish}
                className="text-xs text-slate-400 transition hover:text-slate-600"
              >
                Skip for now (reduced matching accuracy)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionButton({
  label,
  detail,
  selected,
  onClick,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
        selected
          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div>
        <span>{label}</span>
        {detail && (
          <span className="ml-2 text-xs text-slate-400">{detail}</span>
        )}
      </div>
      {selected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
    </button>
  );
}
