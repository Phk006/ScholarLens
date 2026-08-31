# ScholarLens

**Don't make students search. Make the system search for them.**

ScholarLens discovers relevant scholarship opportunities, checks them against your profile, explains the requirements, and keeps watching for changes.

## Features

- **Student DNA** — Build a quick, guided profile for eligibility matching
- **Discovery** — Scan verified scholarship sources automatically
- **Instant Eligibility** — Deterministic rules show exactly why you qualify or don't
- **Better Matches** — Alternative recommendations when you're not eligible
- **Scholarship Radar** — Monitor deadline changes, criteria updates, and new scholarships
- **Application Tracker** — Track your progress across multiple applications
- **AI Guide** — Contextual assistant that helps you understand results
- **3D Universe** — Visual scholarship exploration (optional, accessible fallback always available)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Firebase Authentication (Google)
- Cloud Firestore
- React Three Fiber + Drei (3D)
- Framer Motion
- Lucide Icons
- Zod (schema validation)

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

### 5. Build for production

```bash
npm run build
npm run lint
```

## Firebase Setup Guide

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication → Google provider
3. Configure OAuth consent screen (if required)
4. Create Firestore database
5. Deploy Firestore rules: `firebase deploy --only firestore:rules`
6. Configure Firebase App Check (optional)
7. Add production domain to Authentication → Authorized domains

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

- No Aadhaar, PAN, or bank details collected
- Google account used only for authentication
- Profile data stored locally in demo mode
- No government credential collection

## Deployment to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Configure Firebase authorized domain
5. Deploy

## License

MIT
