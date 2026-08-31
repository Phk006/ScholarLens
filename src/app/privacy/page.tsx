import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: August 2026</p>

      <div className="prose prose-slate mt-8 max-w-none text-sm leading-relaxed text-slate-600 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">What We Collect</h2>
          <p>
            ScholarLens collects only the information you voluntarily provide for
            scholarship eligibility matching:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Academic course and year of study</li>
            <li>State and institution type</li>
            <li>Academic performance (percentage/range)</li>
            <li>Family income range (for need-based matching)</li>
            <li>Caste category (for government scholarship matching)</li>
            <li>Gender (where scholarship eligibility requires it)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">What We Do NOT Collect</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Aadhaar number</li>
            <li>PAN number</li>
            <li>Bank account details</li>
            <li>OTP codes</li>
            <li>Government portal credentials</li>
            <li>Google account data beyond authentication</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Google Authentication</h2>
          <p>
            We use Firebase Authentication with Google Sign-In. Your Google account
            is used solely to authenticate you. We do not access your Gmail, Drive,
            Contacts, Calendar, or any other Google service data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Data Storage</h2>
          <p>
            Your profile data is stored securely. In demo mode, data is stored
            locally in your browser and never transmitted to external servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">No Government Credential Collection</h2>
          <p>
            ScholarLens does not collect, store, or process government portal
            login credentials. We direct you to official portals for application
            submission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Data Usage</h2>
          <p>
            Your profile data is used exclusively for computing scholarship
            eligibility matches. We do not sell, share, or use your data for
            advertising purposes.
          </p>
        </section>
      </div>
    </div>
  );
}
