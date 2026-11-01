# RightMinds Africa Security Specification

This document outlines the security architecture and rules for the Firebase Firestore database, ensuring a highly secure posture while accommodating the local-first and passcode-gated administrative workflow of the application.

## 1. Data Invariants & Access Models

### Registrations Collection (`/registrations/{registrationId}`)
* **Pillars of security**: 
  * Public can `create` high-integrity registration dossiers.
  * Public is forbidden from reading, listing, or modifying registered dossiers.
  * Administrators (authorized via passcode/portal) can `read` and `write`.
* **Invariants**:
  * Must contain: `fullName`, `email`, `phone`, `profileType`, `location`, `id`, `registeredAt`.
  * Field lengths must be strictly capped to prevent Denial of Wallet storage attacks.

### Check-ins Collection (`/checkins/{checkinId}`)
* **Pillars of security**:
  * Anyone visiting the platform can `create` a check-in registration.
  * Public is forbidden from reading/listing check-ins.
  * Administrators can `read` and `write` check-ins.
* **Invariants**:
  * Must contain: `name`, `location`, `deviceType`, `purpose`, `id`, `checkedInAt`.

### Settings Collection (`/settings/marquee`)
* **Pillars of security**:
  * Public can `get` (read) the marquee doc to see current site announcements.
  * Public is forbidden from listing the collection.
  * Only administrators can `write` or `update` the scroller config.
* **Invariants**:
  * Must contain: `enabled`, `messages`, `updatedAt` (if writing).
  * Messages must be a bounded list (size <= 10) to prevent list bomb attacks.

---

## 2. Invalidation and "Dirty Dozen" Payloads

Here are payloads designed to break our data schema, which must return `PERMISSION_DENIED`:

1. **Short-circuiting Registrations**: Payload missing mandatory properties e.g. `fullName` or `email`.
2. **Denial of Wallet (DoW) Field Size Explode**: Registration payload where `fullName` is > 128 characters.
3. **Identity Spoofing**: Injecting unsafe/unvalidated fields like role promotions or administrative rights into a registration profile.
4. **Invalid Setting Schema**: Writing to `settings/marquee` with an invalid field type (e.g., `messages` as a primitive string instead of an array).
5. **Setting Ticker Explode**: Setting payload with array size bounds greater than 10.
6. **Setting Message Poisoning**: Setting announcement with message string size > 500 characters.
7. **Malformed Checkin Schema**: Checkin payload missing `deviceType` or `purpose`.
8. **Checkin ID Poisoning**: Specifying malicious/malformed characters in checkin ID.
9. **Zero-Timestamp Spoofing**: Malformed/empty `checkedInAt` field.
10. **Resource Poisoning on Checkin Location**: Checkin with `location` string size > 128 characters.
11. **Malicious Override**: Modifying registration dossiers without passing validator blueprint.
12. **Public Scrape**: Public attempting to call `list` query on `/registrations` or `/checkins`.
