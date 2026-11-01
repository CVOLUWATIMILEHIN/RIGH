# Firestore Database Architecture Blueprint & Documentation
## Right Minds Africa (RMA) & Corper Impact Initiative (CII)

This document defines the enterprise-level database design, schemas, relationships, indexing strategies, and security rules for the cloud-powered RMA & CII portal. 

---

## 1. Architectural Strategy & Design Principles

To ensure scalability, speed, and real-time synchronization for thousands of concurrent users, our Firebase Cloud Firestore design conforms to the following core tenets:

1. **Single Source of Truth (SSOT)**: No critical state is stored in `localStorage` or hardcoded in client components. Real-time synchronizers (`onSnapshot`) listen directly to Firestore paths.
2. **Metadata Uniformity**: Every document contains standardized system fields for tracking audit trails, record versions, and publication state.
3. **Identity & Access Segregation**: Personally Identifiable Information (PII) is isolated or guarded by owner-only read policies.
4. **Denial-of-Wallet (DoW) Mitigation**: Queries utilize compound indexing and server-enforced limits to prevent recursive read amplification.
5. **Soft Delete Lifecycle**: Records are never dropped immediately. Deletion flips a `status` field to `"deleted"` or `"archived"` which moves records to the system Recycle Bin for administrator recovery.

---

## 2. Standardized Metadata Schema

Every document in the database (regardless of collection) must include this base schema payload to maintain auditing and temporal integrity:

```json
{
  "id": "string (UUID or auto-generated Document ID)",
  "createdAt": "timestamp (Firebase ServerTimestamp)",
  "updatedAt": "timestamp (Firebase ServerTimestamp)",
  "createdBy": "string (User UID or system-bot)",
  "updatedBy": "string (User UID or system-bot)",
  "status": "string ('active' | 'draft' | 'archived' | 'deleted')",
  "published": "boolean",
  "version": "number (incremented on major schema updates)"
}
```

---

## 3. Comprehensive Collection Schemas & Relationships

Below is the design spec for every collection. Document schemas are described in TypeScript interfaces for developers.

### Core Identity & Access Control

#### 3.1 `users`
*   **Path**: `/users/{userId}`
*   **Description**: Stores the profile details, contact information, and role bindings of registered learners, mentors, and partners.
*   **Relationships**: Connects to `courseEnrollments` and `eventRegistrations` via `userId`.

```typescript
interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  profileType: "student" | "mentor" | "partner" | "corper";
  institution?: string;
  aspiration?: string;
  bio?: string;
  location: {
    state: string;
    country: string;
  };
  emailVerified: boolean;
  // Metadata Inherited
  createdAt: any;
  updatedAt: any;
  status: "active" | "archived" | "deleted";
}
```

#### 3.2 `admins`
*   **Path**: `/admins/{adminId}`
*   **Description**: Houses elevated credentials and dashboard permissions for staff members.
*   **Relationships**: Reference key for `createdBy`/`updatedBy` metadata fields.

```typescript
interface AdminUser {
  id: string; // Firebase Auth UID matching the admin record
  email: string;
  fullName: string;
  roleId: string; // Reference to /roles/{roleId}
  assignedDepartment: string;
  lastActive: any;
  createdAt: any;
  updatedAt: any;
  status: "active" | "archived";
}
```

#### 3.3 `roles` & `permissions`
*   **Paths**: `/roles/{roleId}` and `/permissions/{permissionId}`
*   **Description**: Implements Role-Based Access Control (RBAC). Roles hold an array of Permission string tags.

```typescript
interface Role {
  id: string; // e.g., 'super_admin', 'editor', 'finance'
  name: string;
  description: string;
  permissions: string[]; // e.g., ['cms:write', 'billing:view', 'users:delete']
  createdAt: any;
  updatedAt: any;
}

interface Permission {
  id: string; // e.g., 'cms:write'
  module: string; // e.g., 'CMS Manager'
  action: string; // e.g., 'write'
  description: string;
}
```

---

### CMS & Homepage Content Delivery

#### 3.4 `heroSlides`
*   **Path**: `/heroSlides/{slideId}`
*   **Description**: Custom sliding hero configurations rendered on the home view.

```typescript
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  published: boolean;
  createdAt: any;
  updatedAt: any;
}
```

#### 3.5 `heroStatistics`
*   **Path**: `/heroStatistics/{statId}`
*   **Description**: Counts, numeric counters, and metrics showcasing impact values on the landing page.

```typescript
interface HeroStatistic {
  id: string;
  label: string;
  value: string; // e.g., "5,000+"
  icon: string; // Lucide icon reference string
  order: number;
  status: "active" | "archived";
}
```

#### 3.6 `announcements`
*   **Path**: `/announcements/{announcementId}`
*   **Description**: High-priority alert bars, tickers, or marquee texts running across the site header.

```typescript
interface Announcement {
  id: string;
  message: string;
  type: "info" | "warning" | "success" | "event";
  link?: string;
  startDate: any;
  endDate: any;
  published: boolean;
}
```

#### 3.7 `popupManager`
*   **Path**: `/website_popups/{popupId}`
*   **Description**: Modal dialog popups running on home or program landing pages with scheduling parameters.

```typescript
interface WebsitePopup {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  buttonText: string;
  buttonLink: string;
  startDate: any;
  endDate: any;
  priority: "high" | "medium" | "low";
  active: boolean;
  displayRule: "once_per_session" | "every_visit" | "first_visit_only";
}
```

#### 3.8 `menus` & `footerContent`
*   **Path**: `/settings/{menuId}` (e.g., `/settings/navigation_menu`, `/settings/footer_content`)
*   **Description**: Structuring parameters for headers, footer copyright links, social URLs, and navigation nodes.

---

### Programs, LMS & Online Academy

#### 3.9 `programs` & `programCategories`
*   **Paths**: `/programs/{programId}` and `/programCategories/{categoryId}`
*   **Description**: Outlines current initiative cohorts (e.g., "Corper Reinvention Cohort", "RMA Mentorship").

```typescript
interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string; // Reference to programCategories
  bannerUrl: string;
  startDate: any;
  durationWeeks: number;
  mentorsCount: number;
  published: boolean;
}
```

#### 3.10 `courses`, `courseModules`, & `courseLessons`
*   **Paths**: 
    *   `/courses/{courseId}` (Core course description)
    *   `/courses/{courseId}/modules/{moduleId}` (Chapters/Modules)
    *   `/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}` (Video or text lectures)
*   **Description**: Dynamic LMS repository hosting learning tracks.

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  category: string;
  price: number; // For paid certification paths
  thumbnail: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  lessonsCount: number;
  status: "active" | "draft" | "archived";
}

interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface CourseLesson {
  id: string;
  title: string;
  duration: string; // e.g., "12:35"
  videoProvider: "vimeo" | "youtube" | "custom";
  videoUrl: string;
  contentMarkdown?: string;
  order: number;
}
```

#### 3.11 `courseEnrollments`
*   **Path**: `/course_enrollments/{enrollmentId}`
*   **Description**: Tracks individual user progress, lessons marked complete, and date of completion.
*   **Relationships**: Relates `/users/{userId}` to `/courses/{courseId}`.

```typescript
interface CourseEnrollment {
  id: string;
  userId: string;
  userEmail: string;
  courseId: string;
  enrolledAt: any;
  progressPercentage: number; // 0 to 100
  completedLessons: string[]; // Array of lesson IDs
  status: "active" | "completed" | "suspended";
}
```

#### 3.12 `courseCertificates`
*   **Path**: `/course_certificates/{certificateId}`
*   **Description**: Automatically generated credential verification codes, print layouts, and validation status.

```typescript
interface CourseCertificate {
  id: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  certificateCode: string; // e.g., RMA-2026-LMS-X90F
  issuedAt: any;
  qrCodeUrl?: string;
}
```

---

### Events, Media & Public Outreach

#### 3.13 `events` & `eventRegistrations`
*   **Paths**: `/events/{eventId}` and `/events/{eventId}/registrations/{regId}`
*   **Description**: Digital or in-person workshop coordinates and applicant booking tables.

```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  eventDate: any;
  timeSlot: string;
  locationType: "virtual" | "physical";
  venue: string; // Link or physical address
  price: number; // 0 if free
  registeredCount: number;
  published: boolean;
}
```

#### 3.14 `galleryAlbums` & `galleryImages`
*   **Path**: `/gallery/{albumId}` with metadata embedding image lists.
*   **Description**: Organizes physical event coverage albums, sliding carousels, and captions.

#### 3.15 `blogPosts` & `blogCategories`
*   **Path**: `/social_posts/{postId}` (Blogs are driven by synced social feeds or direct write-ups)
*   **Description**: Right Minds thoughts, opinions, newsletters, and publications catalog.

#### 3.16 `testimonials` & `partners`
*   **Paths**: `/testimonials/{id}` and `/partners/{id}`
*   **Description**: Verification profiles of partners, sponsors, and program graduates.

---

### Payments, Communications & System Auditing

#### 3.17 `payments` & `bankTransfers`
*   **Path**: `/payments/{paymentId}` and `/bankTransfers/{transferId}`
*   **Description**: Syncs Paystack, Stripe, or manual bank payment validations safely.

```typescript
interface PaymentRecord {
  id: string;
  email: string;
  amount: number;
  currency: string; // e.g., "NGN", "USD"
  paymentMethod: "paystack" | "stripe" | "bank_transfer";
  paymentReference: string;
  status: "success" | "pending" | "failed";
  associatedItemId: string; // Course ID or Event ID
  timestamp: any;
}
```

#### 3.18 `auditLogs` & `visitorLogs`
*   **Path**: `/audit_logs/{logId}` and `/checkins/{checkInId}`
*   **Description**: Real-time auditing records tracking staff panel logins, setting alterations, or guest entry details.

#### 3.19 `notifications`
*   **Path**: `/notifications/{notifId}`
*   **Description**: Central hub for dispatching alerts, enrollment updates, or administrator reports.

---

## 4. Query Patterns & Compound Indexing

To prevent "No Index Found" errors, compound indexing is required for the following query patterns:

1.  **LMS Course Search**:
    *   Query: `.where("status", "==", "active").orderBy("category").orderBy("createdAt", "desc")`
    *   Index Requirement: `courses` -> `status` (Asc), `category` (Asc), `createdAt` (Desc)
2.  **LMS Student Progress Search**:
    *   Query: `.where("userEmail", "==", "user@email.com").orderBy("progressPercentage", "desc")`
    *   Index Requirement: `course_enrollments` -> `userEmail` (Asc), `progressPercentage` (Desc)
3.  **Active Events Display**:
    *   Query: `.where("published", "==", true).where("eventDate", ">=", now).orderBy("eventDate", "asc")`
    *   Index Requirement: `events` -> `published` (Asc), `eventDate` (Asc)
4.  **Blog Category Filtering**:
    *   Query: `.where("status", "==", "published").where("category", "==", "Leadership").orderBy("publishedAt", "desc")`
    *   Index Requirement: `social_posts` -> `status` (Asc), `category` (Asc), `publishedAt` (Desc)

---

## 5. Security Rules Architecture (Zero-Trust)

Our Firebase Security Rules utilize a **Split Collection Strategy** and **Strict Attribute Checks** to achieve absolute coverage.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Default safety net: Deny all writes and reads unless explicitly specified
    match /{document=**} {
      allow read, write: if false;
    }

    // --- UTILITY REUSABLE PRIMITIVES ---
    function isSignedIn() {
      return request.auth != null;
    }

    function isEmailVerified() {
      return isSignedIn() && request.auth.token.email_verified == true;
    }

    // Role Lookup: Only admins registered in the staff database can bypass CMS locks
    function isAdmin() {
      return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Verify user owns the document record
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Safe string validation
    function isValidString(val, maxLen) {
      return val is string && val.size() <= maxLen;
    }

    // --- COLLECTION RULES ---

    // USERS: Users can read and modify their own records. Admins can read all.
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create, update: if isOwner(userId) && isValidString(request.resource.data.fullName, 100);
      allow delete: if isAdmin();
    }

    // COURSES: Read-only for everyone. Admin write.
    match /courses/{courseId} {
      allow read: if resource.data.status == "active" || isAdmin();
      allow write: if isAdmin();
    }

    // ENROLLMENTS: Users see their own. Admin manages.
    match /course_enrollments/{enrollmentId} {
      allow read: if isSignedIn() && (resource.data.userEmail == request.auth.token.email || isAdmin());
      allow create: if isSignedIn() && request.resource.data.userEmail == request.auth.token.email;
      allow update: if isSignedIn() && (resource.data.userEmail == request.auth.token.email || isAdmin());
      allow delete: if isAdmin();
    }

    // CMS CONFIG & SETTINGS: Read-only public. Write only Admin.
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // EVENTS: Read-only public. Admin write.
    match /events/{eventId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // AUDIT LOGS: Read-only for admins. Write for system tasks.
    match /audit_logs/{logId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 6. Offline Support & Sync Recovery Flow

Firestore offline persistence is enabled locally via:

```typescript
import { enableMultiTabIndexedDbPersistence } from "firebase/firestore";

enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn("Firestore persistence precondition failed.");
  } else if (err.code === 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence.
    console.warn("IndexedDB not supported on current environment.");
  }
});
```

*   **Transactional Sync Queue**: When actions (such as event registrations or course payments) occur offline, the platform maintains a synchronized queue using Firestore's local cache. As soon as network status changes to `online`, the SDK pushes pending state changes immediately to the Cloud.

---

## 7. Future Backup & Restore Operations

Automated backups are configured via GCP Cloud Scheduler trigger mapping to a Cloud Function calling:

```bash
gcloud firestore export gs://[YOUR_BACKUP_BUCKET_NAME] --project=[YOUR_PROJECT_ID]
```

This ensures complete point-in-time recovery capabilities in compliance with enterprise data-governance standards.
