# Standalone Clone Guide: Duplicating This CMS Portal For Another Brand

This guide provides complete instructions for cloning, white-labeling, and deploying this enterprise CMS, LMS Academy, and Operations Portal as an independent standalone system for any organization, company, or brand (e.g. Brainbench Technology, Datame Solution, CVSub, EdTech academies, NGOs, or consulting firms).

---

## Architecture Overview

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend / API**: Node.js + Express (`server.ts`) with Vite SSR middlewares
- **Database & Auth**: Google Cloud Firestore & Firebase Authentication (`(default)` database instance)
- **Features Included**:
  - Full Content Management System (Hero slides, events, announcements, memoirs, testimonials, FAQs, partners)
  - Learning Management System (Courses, modules, lessons, student progress, certificates, payments)
  - Cohort Registrations (NYSC corps, undergraduate, teen bootcamps, general applications)
  - Multi-tier Admin Role-Based Access Control (Super Admin, Admin, Standard Write, Editor, Viewer)
  - Live Visitor Telemetry, Live Chat Workspace, and Outbound Email logs
  - Offline-resilient transaction queue (`localStorage` sync)

---

## 1. Fast-Track: 3 Steps to Rebrand This Instance Directly

If you want to rebrand the current deployment right away without moving repositories:
1. Sign in to the **Admin Portal** (`/rmaadmin`).
2. Go to **System Control** &rarr; **Brand & Cloner Hub**.
3. Select a preset (e.g., *Brainbench Technology*, *TechNova Hub*, or *Neutral White-Label*) or upload your logo and custom brand colors.
4. Click **Apply Brand Configuration**. The header, navbar, footer, copyright, and admin portal will immediately re-skin.

---

## 2. Creating a Standalone Clone (Separate Codebase & Project)

To run a completely separate, independent portal with its own private database:

### Option A: Duplicate via Google AI Studio Build
1. In the AI Studio project selector, click the **Options / Duplicate** icon on this project.
2. Name your new clone (e.g., `Brainbench Operations Portal` or `Acme CMS Hub`).
3. Open the newly cloned applet.

### Option B: Clone via Git / Local Development
```bash
# 1. Clone your project repository
git clone <YOUR_GIT_REPO_URL> standalone-cms-portal
cd standalone-cms-portal

# 2. Install all dependencies
npm install

# 3. Start development server on port 3000
npm run dev
```

---

## 3. Connecting a Dedicated Firebase Project

To ensure complete data privacy between brands, connect the clone to a new Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Enable **Firestore Database**:
   - Choose your nearest cloud region (e.g., `europe-west1` or `us-central1`).
   - Start in **Production Mode** or configure Firestore rules.
3. Enable **Authentication**:
   - Go to **Build** &rarr; **Authentication** &rarr; **Sign-in method**.
   - Enable **Email/Password** and **Google** sign-in providers.
4. Register a Web App in Project Settings:
   - Copy the web app configuration values.
5. In your cloned project, update `src/firebase-applet-config.json`:
```json
{
  "apiKey": "AIzaSy...",
  "authDomain": "your-new-brand.firebaseapp.com",
  "projectId": "your-new-brand-id",
  "storageBucket": "your-new-brand.appspot.com",
  "messagingSenderId": "1234567890",
  "appId": "1:1234567890:web:abcdef123456",
  "firestoreDatabaseId": "(default)"
}
```
6. Ensure your `firestore.rules` are deployed or set up to allow authenticated administrators access.

---

## 4. Applying Brand Configuration (`brand.config.json`)

You can customize everything in `src/lib/brandConfig.ts` or export/import `brand.config.json` via the in-app Brand Cloner:

```json
{
  "brandName": "Brainbench Technology",
  "brandShortName": "Brainbench",
  "brandAcronym": "BBT",
  "brandSubTitle": "CREATIVE & TECH LAB",
  "tagline": "Inspiring digital innovation, cutting-edge UI/UX product design, and practical technology education.",
  "portalTitle": "STUDIO COMMAND",
  "logoUrl": "data:image/png;base64,...",
  "primaryColor": "#0F172A",
  "accentColor": "#38BDF8",
  "secondaryColor": "#6366F1",
  "supportEmail": "hello@brainbenchtech.com",
  "supportPhone": "+234 803 123 4567",
  "officeAddress": "Brainbench Innovation Campus, Nigeria",
  "websiteUrl": "https://brainbenchtech.com",
  "socialLinks": {
    "twitter": "https://twitter.com/brainbenchtech",
    "linkedin": "https://linkedin.com/company/brainbenchtech",
    "instagram": "https://instagram.com/brainbenchtech"
  },
  "superAdminEmail": "admin@brainbenchtech.com",
  "copyrightYear": "2026"
}
```

---

## 5. Setting Up the Super Administrator

1. In `src/components/AdminPortal.tsx`, locate the authorized super admin identities:
```typescript
{ email: "your-email@newbrand.com", role: "Website Owner / Primary Super Admin 👑" }
```
2. In `src/lib/brandConfig.ts`, update `superAdminEmail`.
3. Open the portal at `/rmaadmin` and register or log in with your super admin email.
4. Use the **Users List** (`/rmaadmin` &rarr; User Management) to onboard team members, mentors, editors, and course managers.

---

## 6. Cleaning or Resetting Data for the New Brand

When launching a brand new clone, you may want to start with clean registration tables:
1. Go to **Admin Portal** &rarr; **System Control** &rarr; **Brand & Cloner Hub**.
2. Click **Reset Demo Data to Clean Slate**:
   - This clears dummy test candidates while preserving all course structures, page categories, and layout designs.
3. You can also export a fresh backup point at **System Settings** &rarr; **Recovery & Backups Engine**.

---

## 7. Production Deployment Checklist

| Step | Action |
| --- | --- |
| **Build Check** | Run `npm run build` to confirm zero compilation errors. |
| **Dev Server** | Run `npm run dev` or `npm run start` (starts `server.ts` on port 3000). |
| **Custom Domain** | Connect your domain (e.g., `portal.yourbrand.com`) in your cloud provider / hosting settings. |
| **SSL / HTTPS** | Verify HTTPS is active; Firebase Auth popups require HTTPS in production. |
| **Brand Assets** | Replace `src/assets/images/brand_logo_official_new_1780385523572.png` or provide a custom image data URL in the brand cloner. |

---

*Generated for Standalone Brand Cloning and White-Label Distribution.*
