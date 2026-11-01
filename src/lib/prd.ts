/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SYSTEM_PRD_DOCUMENT = `# SYSTEM PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Project Title:** Right Minds Africa (RMA) & Corper Impact Initiative (CII) Digital Ecosystem  
**Document Code:** RMA-CII-PRD-2026-V1.0  
**Status:** Approved / Production-Ready  
**Current Release Version:** 1.0.0  
**Target Architecture:** React 18 / Vite / Tailwind CSS / Firebase Cloud Engine  

---

## 1. Executive Summary & Vision

### 1.1 Project Purpose
The RMA & CII digital ecosystem serves as an integrated full-stack solution designed to catalyze leadership development, social orientation, and economic empowerment among youth in Africa. By combining the social impact outreach programs of **Right Minds Africa** with the specialized professional-transition resources of **Corper Impact Initiative**, the platform acts as an administrative operations centre and a public engagement portal.

### 1.2 Core Product Vision
To host a frictionless gateway that transforms Nigerian Youth Service Corps (NYSC) members, undergraduates, and teenagers into impact-driven leaders through vetted coursework, community orientations, physical hangouts, mentorship networks, and a transparent operations desk.

---

## 2. User Personas & Target Audience

| Persona Group | Primary Needs & Use Cases | Platform Touchpoints |
|:---|:---|:---|
| **NYSC Corps Members** | Seeking NYSC group orientations, career readiness paths, business skills, mentorship, and peers. | CII Multi-Section Space, Registration Forms, Resources Portal |
| **Youth & Teenagers** | Mindset reframing, character building, academic transition guidance, YAP conference updates. | Right-Minded Teens Hub, YAP Conference Panel, Public Media Streams |
| **Mentors & Facilitators** | Guiding cohorts, evaluating leadership essays, verifying developmental assignments. | Registration Dossiers, Team Rosters, Mentor Applications |
| **Administrative Officers** | Monitoring registrations, verifying payment receipts, updating announcements ticker, auditing operations. | Secure Admin Executive Console, Database Sync Pipelines |

---

## 3. Product Architecture & Technology Stack

The platform is designed to guarantee high offline availability, robust security controls, and rich responsive aesthetics:

- **Frontend Core:** React 18 (Hooks-first functional syntax) matching custom lightweight layouts.
- **Micro-Animations:** Framer Motion (motion/react) powering layout transitions, lightbox enters, and accordion collapses.
- **Build Serverless Ecosystem:** Vite development environment.
- **Design Layouts:** Standard Tailwind CSS modern guidelines using Inter, Outfit, and JetBrains Mono fonts.
- **Database Backend:** Persistent Google Firebase Firestore integrated securely via lazy-loaded clients; with fallback client-side storage cache configurations (localStorage) and offline synchronization event cues.
- **Web Analytics & Data Visuals:** Recharts-driven visualizers charting telemetry, registrations distribution, and geo-demographics.

---

## 4. Comprehensive Feature Specifications & Core Modules

### 4.1 Authentication & User Management
The platform mandates a secure authentication blueprint supporting role-based logins, token security, and administrative sessions protection:

#### 4.1.1 Authentication Flows
1. **Email & Password Login:** Secure endpoint access validating entries against Firebase Auth. Includes account lookup, encrypted password match, and automatic session token delivery.
2. **Password Reset Flow:** Sandbox and live password recovery triggering personalized, time-limited reset link dispatches on demand.
3. **Email Verification:** Mandated onboarding check blocks full access for standard user registers until email ownership validation completes successfully.
4. **Remember Me Session:** Employs cryptographically secured local storage flags to persist logins across tabs while preserving standard expiry terms.
5. **Device Session Management:** Session tracing tracking concurrent administrator sessions, registering IP locations, device models, and browser parameters with single-tap remote terminations.
6. **Multi-Factor Authentication (MFA):** Optional security layer prompting administrators for secondary authentication codes in highly restrictive corporate actions (e.g. database purge).

#### 4.1.2 Role-Based Access Matrix
| Role | Assigned Level | System Access & Capabilities |
|:---|:---|:---|
| **Super Admin** | Tier 5 (Owner) | Complete administrative access, database reset permission, admin creations, suspension triggers, full audit log access, and backup restores. |
| **Admin** | Tier 4 (Operator) | Operational access. Processes registrations, approves/rejects payments, edits FAQs, moderates galleries, and modifies marquee announcements. |
| **Mentor** | Tier 3 (Facilitator) | Access to Mentor Portal. Conducts nominee evaluations, views assigned cohorts, and enters mentorship essays grading grades. |
| **Viewer** | Tier 2 (Auditor) | Read-only reporting dashboard view. Inspects datagrid registers, views analytics charts, and exports CSV. Writing capabilities disabled. |
| **Public User** | Tier 1 (Visitor) | Public web portal access. Registers for programs, signs the live visitor guestbook, views the previous events photo gallery, and downloads worksheets. |

---

### 4.2 Unified Database Architecture & Collections
The production database employs Google Cloud Firestore, operating on a structured collections framework defined below:

#### 4.2.1 Collection Schemas & Data Types
1. **users**
   - uid (String, Primary Key)
   - email (String)
   - role (Enum: 'Super Admin' | 'Admin' | 'Mentor' | 'Viewer' | 'Public User')
   - status (Enum: 'Active' | 'Suspended')
   - createdAt (Timestamp)
2. **registrations**
   - id (String, Primary Key)
   - fullName (String)
   - email (String)
   - stateCode (String) -- *Required for NYSC corps members*
   - batch (String)
   - phone (String)
   - paymentStatus (Enum: 'Pending' | 'Under Review' | 'Verified' | 'Rejected')
   - registrationStatus (Enum: 'Applied' | 'Pending Approval' | 'Approved' | 'Archived')
   - notes (String)
   - createdAt (Timestamp)
3. **payments**
   - id (String, Primary Key)
   - registrationId (String, Foreign Key)
   - bankName (String)
   - receiptUrl (String) -- *Reference to Firebase Storage link*
   - amountPaid (Number)
   - verificationNotes (String)
   - updatedAt (Timestamp)
4. **gallery**
   - id (String, Primary Key)
   - title (String)
   - category (Enum: 'YAP Conference' | 'Right-Minded Teens' | 'CII')
   - image (String) -- *Base64 string or verified storage URL*
   - description (String)
   - date (String)
   - createdAt (Timestamp)
5. **announcements**
   - id (String, Primary Key)
   - content (String)
   - active (Boolean)
   - updatedBy (String)
   - updatedAt (Timestamp)
6. **audit_logs**
   - id (String, Primary Key)
   - adminEmail (String)
   - action (String)
   - details (String)
   - timestamp (Timestamp)
7. **guestbook**
   - id (String)
   - name (String)
   - location (String)
   - timestamp (Timestamp)
8. **events**
   - id (String, Primary Key)
   - title (String)
   - date (String)
   - location (String)
   - description (String)
   - capacity (Number)
   - registrationLink (String)
   - bannerUrl (String)
9. **resources**
   - id (String, Primary Key)
   - title (String)
   - category (Enum: 'PDF' | 'Video' | 'Audio' | 'Article')
   - downloadUrl (String)
   - fileSize (String)
   - downloadsCount (Number)
10. **notifications**
    - id (String, Primary Key)
    - recipientEmail (String)
    - type (String)
    - channel (Enum: 'Email' | 'WhatsApp' | 'In-App')
    - sent (Boolean)
    - timestamp (Timestamp)
11. **settings**
    - id (String, Primary Key)
    - brandMarquee (String)
    - maintenanceMode (Boolean)
    - backupFrequency (String)

---

### 4.3 Notification Engine
The notification module guarantees real-time notification delivery across multiple communication vectors:

#### 4.3.1 Notification Vectors
1. **Registration Success Notifications:** Automatic triggers dispatching emails and in-app updates upon standard candidate registrations.
2. **Payment Approval Notifications:** Dispatches transactional alerts confirming successful invoice verification and cohort allocations.
3. **Event Reminders:** Cron-driven triggers launching upcoming hanger-out assemblies, seminars, and orientation reminders.
4. **Admin Alerts:** Dispatches security notifications to super administrators on suspicious system log entries (e.g. repeated unauthorized dashboard access attempts).
5. **Announcement Broadcasts:** Coordinates instantaneous site-wide banner updates and ticker announcements broadcasts.

#### 4.3.2 Integrated Notification Channels
- **Email:** Simple Mail Transfer Protocol (SMTP) or Firebase cloud triggers sending transaction emails.
- **WhatsApp Links:** Formulates pre-populated deep-links allowing operators or candidates to click and jump into WhatsApp channels instantly with pre-written scripts.
- **In-App Notifications:** Real-time push bells alerting administrators or users inside active sessions.

---

### 4.4 Payment Verification Module
Candidate registrations are paired with a structural invoice verification flow to control cohort approvals cleanly:

#### 4.4.1 Verification Lifecycle Flow
- Candidate Registration ---> Bank Transfer Output Receipt Upload
- Verification Queue Inbox Under-Review ---> Manual Verified Check Evaluation
- Decisions Branch: Verified (Approve Status) OR Rejected/Incomplete (Request Resubmission)

#### 4.4.2 Specifications
- **Bank Transfer Upload:** Simple local instructions detailing banking instructions for payment.
- **Receipt Upload Input:** Support for clear image captures or PDF invoices uploads.
- **Verification Queue Drawer:** Displays chronological pending lists with dual panel controls: "Verify Transaction" and "Reject Invoice".
- **Validation Audit State:** Prevents re-submitting receipts once flagged as "Verified".

---

### 4.5 Content Management System (CMS) Panel
Admins can customize static content configurations dynamically, eliminating manual code revisions entirely:

- **Homepage Content Customizer:** Direct editable state fields controlling banner headlines, hero illustrations, sub-headers, and program statistics.
- **Program Descriptions Panel:** Customizers adjusting Right-Minded Teens, Young Leaders, and Annual YAP details, tuition schedules, and admission limits.
- **Team Bios Roster:** Admin form permitting photo, name, designation, and bio creations for new leadership board members.
- **FAQ Portal Creator:** Streamlines standard questions insertions, revisions, and order hierarchies on the public page.
- **Events & Resource Vault Uploads:** Direct control tables permitting metadata additions, categorizations, file attachments, and active visibilities rules.

---

### 4.6 Event Management System
Specifically engineered for physical and webinar engagements across RMA & CII networks:

- **Event Categories Supported:** Conferences, Social Hangouts, Webinars, and Physical Orientation assemblies.
- **Field Constraints:** Mandates validating titles, calendar timelines, addresses/meeting URLs, description write-ups, attendance limits, registration form links, and header imagery.
- **Seat Caps Control:** Tracks registrations dynamically, turning off reservation buttons automatically once seating limits are exhausted.

---

### 4.7 Resource Library Management (The Resource Vault)
Provides vetted career worksheets, podcasts, books, and courses to members:

- **Resource Categories Supported:** PDF Worksheets, Video masterclasses, Mindset Podcasts, and Career Articles.
- **Operational Matrix for Administrators:**
  - **Upload Form:** Set title, assign descriptions, set URL path, select media category and configure file sizes.
  - **Archive/Delete Actions:** Set hidden statuses or trigger database deletions instantly.
  - **Feature Highlight Option:** Prominently displays specialized materials at top-level site widgets.
- **Public Interactive Features:**
  - **Frictionless Download:** Simple single-click downloads triggering asynchronous analytics count registers.
  - **Fuzzy Search:** Filter titles and tags dynamically in the search inputs.
  - **Category Tabs:** Fast category filtering from simple tab selectors.

#### 4.7.1 Global Omnidirectional Search Hub
- **Description:** Implements an interactive multi-category search bar integrated into the header navigation bar (responsive across small mobile to ultra-wide desktop monitors).
- **Control Modalities:** Keyboard-accessible hotkey triggers (Cmd/Ctrl + K) instantly launch a widescreen Spotlight Command Palette overlay. Includes responsive backdrop blurring and autofocus typing.
- **Search Scope Database:** Indexes all active site components including NYSC programs, summer freelancing bootcamps, community events, resource PDF folders, and individual FAQ topics.
- **Micro-interactions:** Category badges matching color tokens (Orange for Events, Blue for Resources, Emerald for FAQs) accompany result listings, enabling instantaneous one-click route transition jumps.

#### 4.7.2 Newsletter Email Subscription Form
- **Description:** Integrates an inline, lightweight email capture form in the website footer column.
- **Database Architecture Integration:** Interacts directly with the Firestore '/newsletter' collection validating and persisting subscriber emails while caching them locally inside standard client browser buffers to avoid network latency.
- **Visual Feedback States:** Success checkmarks and animated failure logs trigger automatically with auto-dismiss timers, maintaining standard clean margins on all screens.


---

### 4.8 Super Admin Control Center
A dedicated dashboard workspace isolated specifically for owner controls:

- **Target Owner Email:** Olosundelouis@gmail.com (Authorized global keyholder account).
- **Owner System Capabilities:**
  1. **Manage Administrators:** Create standard operators other than self; toggle "Suspended" switches instantly locking administrative accounts.
  2. **Audit Timelines Audit:** View global audit trails, including granular filter logs showing date ranges, admin emails, actions, and details.
  3. **Restore Safeguards:** Reinstate erroneously deleted candidate dossiers from logical tables before permanent sweep cleanups.
  4. **Manual Trigger Backups:** Initialize instant backups and create secure ZIP downloads of the administrative directory.
  5. **Global System Reset Authorization:** Extreme security tool triggers database wipes, repopulating blank states with mock cohorts for tests. Requires special passphrase authorization.

---

### 4.9 Backup & Disaster Recovery Framework
Guarantees uninterrupted operational safety and business continuity:

- **Daily Automated Backups:** Schedule-based automated JSON backups archiving Firestore registries.
- **Weekly Full Snapshots:** Core code bundle and database compilation snapshots kept in isolated storage.
- **Restore Point Lists Dashboard:** Lists and monitors previous points, permitting simple rollbacks if structural anomalies develop.
- **Backup Status Monitors:** Displays server statuses, file sizes, last successful triggers, and cloud drive health metrics.

---

### 4.10 Media Storage Architecture (SaaS Media Deck)
Provides high-performance media serving and file compression for user-submitted event photos and receipts:

- **Cloud Storage Integration:** Plugs cleanly into Google Firebase Storage, returning secure Content Delivery Network (CDN) pointers.
- **Dynamic Image Compression:** Automatic browser-side downscaling compressing high-resolution user pictures to a maximum of 1440px wide prior to transmission.
- **Progressive Image Loading:** Blurs heavy preview imagery during loading cycles before rendering crisp HD copies.
- **Explicit File Sanitization:** Restricts uploads exclusively to safe mime-type indicators: image/jpeg, image/jpg, image/png, and image/webp.
- **Duplicate Image Truncation:** Compares byte lengths or hashes prior to uploading new memories, skipping duplicates instantly.
- **File Upload Limits:** Restricts file sizes to an absolute maximum of 10 Megabytes (10MB) per execution.

---

### 4.11 Core Analytics reporting Dashboard
Provides decision-support stats monitors for internal administrators:

- **Traffic Telemetry Trackers:** Identifies real-time visitor queues, returning member percentages, and average session times.
- **Conversion Metric Indicators:** Graphs candidate registrations versus visitors over custom dates.
- **Page-View Indices:** Tracks most-visited pages (CII program page vs public resources index).
- **Candidate Geo-Demographics Displays:** Charts location states distributions of corps members (Lagos, Abuja, Oyo, Rivers, etc.).
- **Interactive Visualizers Supported:**
  - **Line Charts:** Showing timeline registrations growth trends.
  - **Pie Charts:** Projecting NYSC batches and stream partitions.
  - **Bar Charts:** Comparing registration statuses across different states.
  - **Heat Maps:** Highlighting peak activity hours of user registrations.

---

## 5. Non-Functional Requirements & Design Standards

### 5.1 Mobile Responsiveness Requirements
The platform enforces liquid grid structures checking perfectly across these precise breakpoints:
- **320px (Mobile Small):** Minimum support boundary. Compact headers and vertical layouts.
- **375px (Mobile Medium):** Standard screen configuration for compact handheld devices.
- **425px (Mobile Large):** Layout supports fluid columns and dynamic card widths.
- **768px (Tablet):** Shifts menus to compact lateral navigation sidebars or drawer layouts.
- **1024px (Laptop Small):** Full horizontal desktop menus with collapsible side panels.
- **1440px (Desktop HD):** Generous margins, fluid widescreen grids, and side-by-side bento layouts.
- **1920px (Widescreen XL):** Maximum layout width caps prevent text blocks from stretching wider than 1440px to preserve comfortable reading tracks.

### 5.2 Universal Accessibility Standards
- **WCAG 2.1 AA Compliance Guidance:** Form elements must maintain clear focus lines, elements use descriptive alt tags, and page contrast ratios are kept high.
- **Keyboard Navigation Support:** Users can skip links and tab into page forms, links, buttons, and lightboxes with the keyboard.
- **Screen Reader Support:** Explicit aria-label properties are configured across all non-text buttons, icons, and close action triggers.
- **Highly Visible Focus Indicators:** Interactive inputs feature bright blue wrapping rings when active.
- **Accessibility Color Contrasts:** Core headings and prose maintain contrast ratios matching AAA standards (minimum 4.5:1 text-to-contrast weight).

### 5.3 Integrated Security & Compliance Framework
- **Firebase Security Rules:** Implements secure server rules restricting database writes to authenticated operators. Prevents public modifications to audit logs and core registrations.
- **Role-Based Access Control (RBAC):** Restricts dangerous system operations (such as deleting candidate records) to Tier 4 (Admin) and Tier 5 (Super Admin) roles.
- **Cross-Site Scripting (XSS) Protection:** All inputs are escaped and sanitized prior to browser-side logging or HTML renderings.
- **Cross-Site Request Forgery (CSRF) Safeguards:** Restricts API endpoint requests to specific origin domains and secure header keys.
- **File Upload Validation:** Inspects and sanitizes file extensions, rejecting executables or script injections instantly.
- **Rate-Limiting Shields:** Restricts login entry and contact form submissions to prevent programmatic denial-of-service attempts.

---

## 6. Recommended Release Structure

### Phase 1.0 (Current Baseline Release)
- **Deployment of Public Site:** Home core portal and Right-Minded Teens space.
- **CII Program Space:** Includes the dynamic pricing calculator, FAQ accordion, and NYSC registration forms.
- **Operations Admin Center:** Portal dashboard, registrations dossiers database grids with full search matching, bulk CSV exports, live visitor tracking, system audit logs, and the product requirements document.
- **Media Memoir Gallery Module:** Integrated photo gallery supporting category filters, HD lightboxes, share buttons, cloud Photos links, and local file uploads.

### Phase 1.5 (Planned Quarter 3 Release)
- **Payment Verification Ledger:** Incorporates bank transfers verification queues and automated receipt validations.
- **Analytics Visualization Suite:** Line graphs and bar charts plotting geo-distributions of NYSC segments.
- **Automated Notifications Suite:** Integrates transactional emails via SMTP triggers.
- **Event Scheduling Engine:** Interactive CMS permitting administrators to design and publish new physical conferences on the public homepage.

### Phase 2.0 (Planned Quarter 4 Release)
- **Dedicated Mentor Panel Workspace:** Provides portals for facilitators to log assignments scores and essays feedback.
- **User Accounts Community Portal:** Enables candidate logins, progress trackers, and certificate downloads.
- **Internal Discussion Forums:** Community messaging spaces linking past and present cohorts together.
`;
