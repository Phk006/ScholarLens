import Link from "next/link";
import { ArrowLeft, Search, Shield, Target, Radar, FileText, Globe } from "lucide-react";

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

      {/* Live Link Banner */}
      <a
        href="https://one-thing-i-would-specifically-tell.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition hover:bg-emerald-100"
      >
        <Globe className="h-5 w-5 flex-shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Live Application</p>
          <p className="text-xs text-emerald-600">
            one-thing-i-would-specifically-tell.vercel.app
          </p>
        </div>
      </a>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">What is ScholarLens?</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            ScholarLens is a scholarship discovery platform that automatically finds
            relevant financial aid opportunities, checks your eligibility against
            each one, and explains the results — all without you having to search
            through dozens of government portals and deadline trackers yourself.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            <strong>Don&apos;t make students search. Make the system search for them.</strong>{" "}
            That is the core idea. Most students miss scholarships not because they
            are ineligible, but because they never found out the opportunity existed
            in the first place. ScholarLens closes that gap.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">How it helps you find scholarships seamlessly</h2>
          <div className="mt-4 space-y-4">
            {[
              {
                icon: Target,
                title: "Build your Student DNA",
                desc: "Answer a few guided questions about your income, category, course, state, and academic record. This creates your eligibility profile in under 3 minutes.",
              },
              {
                icon: Search,
                title: "We find scholarships for you",
                desc: "ScholarLens scans verified sources — the National Scholarship Portal, Ministry of Education, and recognised foundations — to find every opportunity that matches your profile. You do not need to know where to look.",
              },
              {
                icon: Shield,
                title: "Instant eligibility results",
                desc: "Deterministic rules (not guesswork) compare your profile against each scholarship's real requirements. You see exactly why you qualify or don't, with clear explanations.",
              },
              {
                icon: Radar,
                title: "We keep watching",
                desc: "The Scholarship Radar monitors sources for deadline changes, updated criteria, and new opportunities. You get notified when something changes — you do not have to keep checking back.",
              },
              {
                icon: FileText,
                title: "Track your applications",
                desc: "Save scholarships, track application status, and manage deadlines from a single dashboard. We never submit applications on your behalf — we always direct you to the official portal.",
              },
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
          <h2 className="text-xl font-semibold text-slate-900">Why students miss scholarships</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            India has hundreds of government and private scholarships, but most
            students only hear about 2 or 3. The rest stay invisible because they
            are scattered across different portals, announced with short deadlines,
            and written in dense bureaucratic language. ScholarLens aggregates them
            in one place, translates the requirements into plain language, and
            matches them to your profile automatically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Verified Sources</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Every scholarship record in ScholarLens includes the source URL,
            source authority, verification status, and last verification date.
            We only surface data from official and trusted sources.
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

        {/* Bottom CTA */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-sm font-semibold text-slate-900">
            Ready to find scholarships made for you?
          </p>
          <a
            href="https://one-thing-i-would-specifically-tell.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Open ScholarLens →
          </a>
        </div>
      </div>
    </div>
  );
}
