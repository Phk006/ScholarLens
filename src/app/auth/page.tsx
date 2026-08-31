"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { Search, Shield, CheckCircle2, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (loading || profileLoading) return;
    if (user) {
      if (profile && (profile.course || profile.completedSteps.length > 0)) {
        router.replace("/discover");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [user, loading, profile, profileLoading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  if (user) return null;

  const handleDemoAccess = () => {
    // Create a mock user for demo mode without Firebase
    const mockUser = {
      uid: "demo-user-001",
      email: "demo@scholarlens.app",
      displayName: "Demo Student",
      photoURL: null,
    };
    // Store in localStorage and reload to trigger auth context
    localStorage.setItem(
      "scholarlens-demo-user",
      JSON.stringify(mockUser)
    );
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left: Auth Card */}
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <a href="/" className="mb-8 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                <Search className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold text-slate-900">
                Scholar<span className="text-emerald-600">Lens</span>
              </span>
            </a>

            <h1 className="text-2xl font-bold text-slate-900">
              Welcome to ScholarLens
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Find scholarships meant for you.
            </p>

            {/* Google Sign-in */}
            <button
              onClick={signInWithGoogle}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            {/* Privacy note */}
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                <p className="text-xs leading-relaxed text-slate-500">
                  Your Google account is only used to securely sign you into
                  ScholarLens. We do not access your email, contacts, files, or
                  any other Google data.
                </p>
              </div>
            </div>

            {/* Demo access */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <button
                onClick={handleDemoAccess}
                className="text-sm font-medium text-slate-400 transition hover:text-slate-600"
              >
                Explore first (demo mode) →
              </button>
            </div>
          </div>
        </div>

        {/* Right: Illustration/Info */}
        <div className="hidden bg-slate-50 lg:flex lg:flex-1 lg:items-center lg:justify-center">
          <div className="max-w-md px-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Don&apos;t make students
              <br />
              <span className="text-emerald-600">search for scholarships.</span>
            </h2>
            <p className="mt-4 text-slate-500">
              ScholarLens works for you — discovering, checking, and tracking
              opportunities automatically.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Instant eligibility checking",
                "Explainable results",
                "Official source links",
                "Privacy-first design",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
