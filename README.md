
# ScholarLens

> **Don't make students search. Make the system search for them.**

🎓 **Live App:** [one-thing-i-would-specifically-tell.vercel.app](https://one-thing-i-would-specifically-tell.vercel.app)

ScholarLens is a scholarship discovery platform that automatically finds relevant financial aid opportunities, checks your eligibility against each one, and explains the results — all without you having to search through dozens of government portals and deadline trackers.

---

## Why ScholarLens?

India has hundreds of government and private scholarships, but most students only hear about 2 or 3. The rest stay invisible because they are scattered across different portals, announced with short deadlines, and written in dense bureaucratic language. **ScholarLens aggregates them in one place, translates the requirements into plain language, and matches them to your profile automatically.**

## How It Works

1. **Student DNA** — Answer a few guided questions about your income, category, course, state, and academic record. Creates your eligibility profile in under 3 minutes.
2. **Automatic Discovery** — ScholarLens scans verified sources (National Scholarship Portal, Ministry of Education, recognised foundations) to find every opportunity matching your profile.
3. **Instant Eligibility** — Deterministic rules (not guesswork) compare your profile against each scholarship's real requirements. You see exactly why you qualify or don't.
4. **Scholarship Radar** — Monitors sources for deadline changes, updated criteria, and new opportunities. You get notified when something changes.
5. **Application Tracker** — Save scholarships, track application status, and manage deadlines from a single dashboard.

## Features

| Feature | Description |
|---------|-------------|
| 🧬 **Student DNA** | Build a quick, guided profile for eligibility matching |
| 🔍 **Discovery** | Scan verified scholarship sources automatically |
| ✅ **Instant Eligibility** | Deterministic rules show exactly why you qualify or don't |
| 💡 **Better Matches** | Alternative recommendations when you're not eligible |
| 📡 **Scholarship Radar** | Monitor deadline changes, criteria updates, and new scholarships |
| 📋 **Application Tracker** | Track your progress across multiple applications |
| 🤖 **AI Guide** | Contextual assistant that helps you understand results |
| 🌐 **3D Universe** | Visual scholarship exploration (optional, accessible fallback always available) |

## Big-O Runner (Module 1 — Gamified DSA Learning)

A playable endless-runner game prototype at `/bigo-runner` where **the three lanes of the track are the three answer options**. Swipe to the right answer, build streaks, and learn time complexity on the bus.

### Game Screens

- **Home** — O(1) logo, PLAY button, level info, controls hint
- **Concept Brief** — 3 cards with 8s auto-advance, skippable
- **Running** — HUD with pips, score, streak, question banner, timer
- **Stumble/Flashcard** — misconception explanation overlay at failure
- **Run Report** — score, correct/wrong, misconception breakdown, retry

### Mechanics Implemented

- Three-lane endless runner with pseudo-3D Three.js rendering
- Question gates with 3 answer panels per lane
- `v(n) = min(9.0 + 0.35n, 18.0)` u/s — velocity rises with gates cleared
- `T(n) = max(4.2 - 0.040n, 2.6)` s — reading window never below 2.6s
- `S(n) = v(n) × T(n)` — gate spacing rises then tightens for late-run pacing
- 3-pip cop pursuit with recovery at 4 consecutive correct answers
- Time dilation to 0.35× for 1.5s on failure for flashcard readability
- 150ms grace window for late lane switches
- Boss gates every 15th gate scoring 3×
- 18 questions (Arrays & Hashing) with misconception tags

### Controls

- **Arrow keys / WASD** — switch lanes, jump, roll
- **Touch/mouse swipe** — lane switching on mobile
- **Space bar** — jump

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Firebase Authentication (Google) |
| Database | Cloud Firestore |
| 3D Graphics | React Three Fiber + Drei |
| Game Engine | Three.js (Big-O Runner) |
| Animation | Framer Motion |
| Icons | Lucide Icons |
| Validation | Zod |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a [Firebase project](https://console.firebase.google.com/)
2. Enable **Authentication** → **Google** provider
3. Create a **Firestore** database
4. Deploy Firestore security rules from `firestore.rules`
5. Add your domain to authorized domains

### 3. Set environment variables

```bash
cp .env.example .env.local
```

Fill in your Firebase configuration values.

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for ScholarLens, or [http://localhost:3000/bigo-runner](http://localhost:3000/bigo-runner) for the game.

### 5. Build for production

```bash
npm run build
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── about/          # About page
│   ├── applications/   # Application tracker
│   ├── auth/           # Authentication
│   ├── bigo-runner/    # Big-O Runner game
│   ├── discover/       # Scholarship discovery
│   ├── matches/        # Eligibility matches
│   ├── onboarding/     # Student DNA profile builder
│   ├── privacy/        # Privacy policy
│   ├── profile/        # User profile
│   ├── radar/          # Scholarship radar
│   └── scholarships/   # Individual scholarship pages
├── components/
│   ├── AIGuide.tsx
│   ├── Providers.tsx
│   ├── layout/         # AppNav, AuthLayout
│   ├── three/          # 3D Scholarship Universe
│   └── ui/             # Badge and shared UI
├── data/
│   ├── bigo-runner-questions.ts  # 18 DSA questions
│   └── scholarships.ts           # Verified scholarship data
└── lib/
    ├── auth-context.tsx
    ├── bigo-runner/     # Game engine, renderer, input, types
    ├── eligibility.ts
    ├── firebase.ts
    ├── profile-context.tsx
    └── types.ts
```

## Firestore Security Rules

Deploy `firestore.rules` to enforce:

- Users can only read/write their own profile, saved scholarships, and applications
- Scholarship master records are read-only for clients
- No client can assign itself admin privileges
- All writes are validated against expected schema

## Scholarship Data

ScholarLens includes verified scholarship records from:

- [National Scholarship Portal](https://scholarships.gov.in/)
- [Ministry of Education](https://www.education.gov.in/scholarship-and-fellowships-students)
- Verified foundation/CSR programs

All records include `sourceUrl`, `applicationUrl`, `sourceAuthority`, `lastVerifiedAt`, and `verificationStatus`.

## Privacy

- **No Aadhaar, PAN, or bank details collected**
- Google account used only for authentication
- Profile data stored locally in demo mode
- No government credential collection

## Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Configure Firebase authorized domain
5. Deploy

**Live:** [one-thing-i-would-specifically-tell.vercel.app](https://one-thing-i-would-specifically-tell.vercel.app)

## License

MIT
