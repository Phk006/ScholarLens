import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Shield,
  Bell,
  ArrowRight,
  Sparkles,
  FileText,
  Target,
  Radar,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              <Search className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold text-slate-900">
              Scholar<span className="text-emerald-600">Lens</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/auth"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:px-6 lg:pt-28 lg:pb-32">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-50 opacity-60 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-50 opacity-60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Discover · Understand · Apply
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Don&apos;t make students
            <br />
            <span className="text-emerald-600">search for scholarships.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 sm:text-xl">
            Make the system search for them. ScholarLens discovers relevant
            opportunities, checks eligibility against your profile, explains the
            requirements, and watches for changes.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-emerald-600/30"
            >
              Find my scholarships
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-7 py-3.5 text-base font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-slate-100 bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: CheckCircle2, text: "Verified sources" },
            { icon: Target, text: "Explainable eligibility" },
            { icon: Shield, text: "Privacy-first profile" },
            { icon: FileText, text: "Official application links" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-sm text-slate-600">
              <item.icon className="h-4 w-4 text-emerald-600" />
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How ScholarLens works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-500">
            Five steps from discovery to application. The system does the heavy
            lifting.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <StepCard
              number="1"
              title="Build your Student DNA"
              description="A quick, guided profile tells us what to look for. No sensitive data required."
            />
            <StepCard
              number="2"
              title="We scan verified sources"
              description="ScholarLens checks government portals, foundations, and verified scholarship databases."
            />
            <StepCard
              number="3"
              title="Instant eligibility results"
              description="See exactly why you qualify, don't qualify, or need to verify something. Every criterion is explained."
            />
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <StepCard
              number="4"
              title="Track and apply"
              description="Save matches, track application status, and get directed to official portals."
            />
            <StepCard
              number="5"
              title="Radar watches for changes"
              description="We monitor scholarship data for deadline changes, updated criteria, and new opportunities."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-100 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built for students, not for data collection
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Target className="h-5 w-5" />}
              title="Instant refusal"
              description="Don't waste time on scholarships you won't get. We tell you immediately and explain why."
            />
            <FeatureCard
              icon={<Radar className="h-5 w-5" />}
              title="Change detection"
              description="Scholarship criteria change. We notice and alert you when something becomes relevant."
            />
            <FeatureCard
              icon={<FileText className="h-5 w-5" />}
              title="Real official links"
              description="Every scholarship links to its official source. We never fake portals or claim to submit applications."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Privacy-first"
              description="No Aadhaar. No PAN. No bank details. We ask only what's needed for eligibility checking."
            />
            <FeatureCard
              icon={<Search className="h-5 w-5" />}
              title="Natural language search"
              description="Search like a human: 'B.Tech scholarships in Karnataka' or 'Scholarships closing this month'."
            />
            <FeatureCard
              icon={<Bell className="h-5 w-5" />}
              title="Smart radar"
              description="New matches, closing deadlines, eligibility changes — all surfaced proactively."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-emerald-600 px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Stop searching. Start matching.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-emerald-100">
            Build your Student DNA in 2 minutes. ScholarLens handles the rest.
          </p>
          <Link
            href="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
          >
            Find my scholarships
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-[10px] font-bold text-white">
              <Search className="h-3 w-3" />
            </span>
            <span className="font-semibold text-slate-500">ScholarLens</span>
          </div>
          <p>
            ScholarLens does not submit applications on your behalf. We direct
            you to official portals.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-600">
              Privacy
            </Link>
            <Link href="/about" className="hover:text-slate-600">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-6 transition hover:border-emerald-200 hover:bg-emerald-50/30">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
