import Link from "next/link";
import { ArrowLeft, Search, Shield, Target, Radar, FileText, Bell } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <h1 className="text-3xl font-bold text-slate-900">About ScholarLens</h1>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">What is ScholarLens?</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            ScholarLens helps students discover scholarships from verified sources,
            understand eligibility requirements, identify why they do or do not
            qualify, discover better alternatives, and track relevant opportunities.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            The core thesis: <strong>Don&apos;t make students search.
            Make the system search for them.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
          <div className="mt-4 space-y-4">
            {[
              { icon: Target, title: "Student DNA", desc: "Build a quick, guided profile that captures your eligibility criteria." },
              { icon: Search, title: "Discovery", desc: "ScholarLens scans verified scholarship sources for opportunities matching your profile." },
              { icon: Target, title: "Eligibility Check", desc: "Deterministic rules (not AI) compare your profile against each scholarship's requirements." },
              { icon: FileText, title: "Apply", desc: "We direct you to official application portals. We never submit applications on your behalf." },
              { icon: Radar, title: "Radar", desc: "We monitor scholarship data for deadline changes, updated criteria, and new opportunities." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-lg border border-slate-100 p-4">
                <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Verified Sources</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            ScholarLens uses real, verified scholarship source data. Every scholarship
            record includes the source URL, source authority, verification status,
            and last verification date.
          </p>
          <div className="mt-4 space-y-2">
            <a
              href="https://scholarships.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-slate-100 p-3 text-sm text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50/50"
            >
              National Scholarship Portal — scholarships.gov.in
            </a>
            <a
              href="https://www.education.gov.in/scholarship-and-fellowships-students"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-slate-100 p-3 text-sm text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50/50"
            >
              Ministry of Education — Scholarship and Fellowships
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Privacy</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            We collect only what is needed for eligibility matching. No Aadhaar,
            no PAN, no bank details, no government credentials. Your Google
            account is used only for authentication.
          </p>
          <Link
            href="/privacy"
            className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Read our privacy policy →
          </Link>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Limitations</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            ScholarLens is a discovery and matching tool. Eligibility results are
            based on your profile and publicly available data — they are not
            official determinations. Always verify requirements on the official
            scholarship portal before applying.
          </p>
        </section>
      </div>
    </div>
  );
}
