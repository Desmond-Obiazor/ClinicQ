# ClinicQ — Clinic Appointment System

A booking app that lets patients book open clinic slots and get a reminder
before their visit — aimed at cutting the walk-in queues that build up at
Nigerian clinics when patients show up without appointments, or forget the
ones they made.

**Live demo:** [add your deployed frontend URL here]
**Demo video:** [add your video link here]

## What's built (MVP)

- **Patients** register (name, phone, email, password), browse open slots
  across clinics, filter by service (e.g. "Eye Clinic," "Dental"), book a
  slot, and see their own appointment history and status.
- **Staff** (one account per clinic) see today's bookings for their own
  clinic only, add new slots, mark a visit completed or no-show, and
  manually trigger a reminder.
- **Reminders** are sent by email via [Resend](https://resend.com) when a
  staff member clicks "Send reminder," or automatically on an hourly check
  for appointments starting within `REMINDER_LEAD_HOURS` (default 24h).
- **Clinic scoping**: staff accounts are tied to one clinic; every staff
  route filters by that clinic, so one clinic's staff can never see or
  modify another's bookings.

## Stack

- Backend: Node.js, Express, PostgreSQL (Neon) via Prisma, JWT auth, node-cron
- Frontend: React (Vite), Tailwind CSS, React Router
- Email: Resend
- SMS (built, not yet active — see below): Termii

## Setup

### Backend

cd backend
cp .env.example .env # fill in DATABASE_URL, JWT_SECRET, RESEND_API_KEY
npm install
npm run prisma:migrate
node prisma/seed.js # creates 3 clinics, 3 staff accounts, open slots
npm run dev


Seeded staff logins (all password `staffpass123`):
| Clinic | Phone |
|---|---|
| Federal Medical Centre, Umuahia | +2348012345678 |
| Abia State Specialist Hospital and Diagnostic Centre | +2348022223333 |
| Christiana Dental Clinic | +2348033334444 |

### Frontend

cd frontend
npm install
npm run dev

Visit `http://localhost:5173`. Register as a patient with a real email
address (needed for the reminder to actually deliver), or log in as staff
with one of the seeded numbers above.

## Design notes

- **Why email, not SMS, for the working demo:** Termii (the Nigerian SMS
  provider chosen for context-fit) gates real SMS sending behind business
  KYC — a registered company — which isn't available to a student fellow.
  Rather than ship a half-working SMS integration, the reminder channel is
  switched to email via Resend, which requires no business verification.
  The Termii integration is fully coded in `src/services/sms.js` and
  `src/jobs/reminderJob.js`, gated behind a single `REMINDER_CHANNEL` env
  var — flipping it to `"sms"` once KYC clears requires no code changes.
- Resend's sandbox sender (`onboarding@resend.dev`) only delivers to the
  developer's own verified email until a custom domain is verified — a
  five-minute DNS step, not a KYC wall, once a real domain is available.
- Phone numbers are normalized to E.164 (`+234...`) at registration.
- The UI uses a ticket motif for slot cards (a punched-notch, dashed-line
  treatment) — a deliberate nod to the app's core idea: patients get a
  ticket instead of a place in a physical line.

## Deliberately out of scope for this MVP

- **Self-service clinic/staff registration.** Staff accounts currently
  come from a seed script, not a sign-up flow. A clinic's first staff
  account is a real trust decision (see the security note on
  `/auth/register` below) and deserves proper design, not a rushed one.
- Cancel/reschedule flow
- Live SMS sending (built, pending Termii business KYC — see above)
- Audit logging, delivery logs beyond console output, automated tests
- Payments, patient history/EHR features

These are left out on purpose: the brief rewards a small, fully-working
loop over a broad, partially-working one. A fuller list of what's needed
before a real clinic and real patient data touch this system — security
hardening, NDPC compliance, reliability — exists as a separate internal
checklist, since none of it blocks this MVP.

## Security note

`/auth/register` always creates `PATIENT` accounts; `role` is never read
from the client. Staff accounts can only be created via the seed script for
this MVP, closing the self-registration-as-staff gap that existed in an
earlier version of this project.