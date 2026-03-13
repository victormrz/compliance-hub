# ComplianceHub — Build Skills & Context

> Session continuity reference. Read this + LESSONS.md + CHANGELOG.md before starting work.

---

## What This App Is

**ComplianceHub** is a GRC (Governance, Risk, Compliance) web application for **Roaring Brook Recovery**, a behavioral health facility in Lexington, KY operating SUD Residential, IOP/PHP, and Sober Living programs.

It tracks compliance across four regulatory bodies:
1. **CARF International** — Behavioral health accreditation (program-level)
2. **The Joint Commission (TJC)** — Healthcare accreditation (organization-level)
3. **Kentucky DBHDID** — State licensing (908 KAR 1:370, 908 KAR 1:372)
4. **Federal** — HIPAA (45 CFR 164) + 42 CFR Part 2 (SUD-specific confidentiality)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Auth | MSAL (@azure/msal-browser + @azure/msal-react) |
| API | Microsoft Graph API (SharePoint + OneDrive) |
| Database | SharePoint Lists (via Graph) |
| File Storage | OneDrive / SharePoint Document Libraries |
| Hosting | GitHub Pages (custom domain: compliance.roaringbrookrecovery.com) |
| CI/CD | GitHub Actions (.github/workflows/deploy.yml) |
| Repo | https://github.com/victormrz/compliance-hub (public) |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/data/mockData.js` | All mock data (will be replaced with SharePoint) |
| `src/lib/graphService.js` | SharePoint CRUD via Microsoft Graph API |
| `src/lib/msalConfig.js` | Azure AD / MSAL configuration |
| `src/hooks/useSharePointData.js` | Data hook with audit logging |
| `src/components/FormModal.jsx` | Reusable form modal with validation |
| `src/App.jsx` | All 15 routes + role-based access |
| `SCHEMA_MAP.md` | SharePoint list schema blueprint (v2, 19 lists) |
| `ROADMAP.md` | Full implementation roadmap (5 phases) |
| `docs/CHANGELOG.md` | Session-by-session change log |
| `docs/LESSONS.md` | Mistakes to avoid (22 lessons) |
| `docs/ARCHITECTURE.md` | Data model decisions |

---

## Azure AD Config

| Setting | Value |
|---------|-------|
| Client ID | 651dbe03-ed62-44b3-a6a9-0151359eb775 |
| Tenant ID | be7f6450-b41a-45e7-8995-23c2a419e1e6 |
| Redirect URIs | localhost:5173, victormrz.github.io/compliance-hub/, compliance.roaringbrookrecovery.com |
| API Permissions | User.Read, Sites.ReadWrite.All, Files.ReadWrite.All |

---

## CARF 2025 Folder (Production Reference)

**Location:** `Roaring Brook Clinical Team > Documents > General > CARF 2025`
**SharePoint URL:** `roaringbrookrecovery.sharepoint.com/sites/RoaringBrookClinicalTeam`

**Local copy:** `reference/carf-2025/` (gitignored, 514 files, 97MB)

### Folder Structure (24 CARF section folders):
```
Section 1 — ASPIRE (Organization-Level):
  1A - Leadership
  1C - Strategic Planning
  1D - Input from persons served
  1E - Legal Requirements
  1F - Financial Planning and Management
  1G - Risk Management
  1H - Health and Safety
  1I - Workforce Development
  1J - Technology
  1K - Rights of Persons Served
  1L - Accessibility
  1M - Performance Measurement
  1N - Performance Improvement

Section 2 — BH General Program Standards:
  2A - Program-Service Structure
  2B - Screening and Access to Services
  2C - Person Centered Plan
  2D - Transition and Discharge
  2E - Medication Use
  2F - Promoting Nonviolent Practices
  2G - Records of the Persons Served
  2H - Quality Records Management

Section 3 — Program-Specific:
  3M - Intensive Outpatient Treatment (IOP) — 6 files
  3O - Outpatient Treatment (OT) — 2 files
  3P - Partial Hospitalization (PH) — 7 files

Topic Folders:
  BOUNDARIES AND ETHICS OF STAFF
  Fire Drills
  JOB DESCRIPTIONS
  PEER INCLUSIVE
  Policies & Procedures (as of 11.2021)
  Program Outline and IOP Schedule
  Required Documentation
  SAMPLE ORIENTATION PACKET
  SAMPLE PARTICIPANT CHART

Root-Level Files:
  CARF COMPLIANCE ASSIGNMENT SHEET.xlsx  ← existing task tracker
  Appendix A - Required Written Documents
  Appendix B - Operational Timelines.rtf
  Appendix C - Required Training.rtf
  + 11 more documents
```

---

## Data Model Status

**Current:** All mock data, flat structure, string-based cross-references
**Target:** SharePoint lists with crosswalk layer for multi-body compliance

### Key Research Findings (Session 2)

1. **CARF numbering:** Section.Subsection.Standard (e.g., 1.A.3)
2. **TJC numbering:** Chapter.Major.Minor.Sub (e.g., CTS.02.01.09) with Elements of Performance (EPs) under each
3. **CARF accredits programs individually** — need program applicability tagging
4. **TJC accredits entire organization** — applicability determined by Standards Applicability Process
5. **Need crosswalk table** — maps equivalent requirements across CARF, TJC, State, Federal
6. **Evidence reuse** — one document can satisfy multiple standards across multiple bodies
7. **Roaring Brook programs:** RT (Residential), IOP, PHP, CH (Community Housing/Sober Living)
8. **ASAM levels:** 3.1/3.5 (Residential), 2.1 (IOP), 2.5 (PHP)

---

## People

| Name | Role | In App |
|------|------|--------|
| Victor Rivera | Executive Director, builds all tech | admin |
| Dave Thomas | Created CARF 2025 folder structure | — |
| Hacky Kantar | Shared files (Daily Attendance, etc.) | — |
| Sarah Williams | Clinical Director (mock data) | manager |
| Mike Johnson | Facilities Manager (mock data) | end_user |
| Jennifer Davis | Compliance Officer (mock data) | manager |

---

## What Needs To Happen Next

> See `ROADMAP.md` for full implementation plan with checkboxes

**Immediate (Phase 1):**
1. Fix mockData.js (wrong KAR ref, add CARF codes, add PolicyNumber, role-based assignment)
2. Create 19 SharePoint lists on ComplianceHub site per SCHEMA_MAP.md v2

**Then (Phase 2):**
3. Wire each page to live SharePoint data via Graph API
4. Add new views: Crosswalk, Evidence tracker, Program filter

**Then (Phase 3):**
5. Load real data: ~150 standards, 62 policies, 23 training courses, 46 tasks, ~360 evidence records

**Before Go-Live (Phase 4):**
6. Remove `?test=1` auth bypass
7. Real role detection from Azure AD groups
8. Error handling, loading states, offline support

## Reference Data Inventory (from CARF 2025 folder analysis)

| Source | Records | Status |
|--------|---------|--------|
| Standards (CARF/TJC/State/Federal) | ~150 | Needs extraction |
| Policies (HR-00 to HR-28, TS-01 to TS-31) | 62 | Inventoried |
| Training Requirements (Appendix C) | 23 | Fully extracted |
| Recurring Tasks (Appendix B) | 46 | Fully extracted |
| Task Assignments (Assignment Sheet) | 45 | Analyzed |
| Evidence Documents (section folders) | ~360 | Counted per folder |
| Section Folders | 24 | Mapped with file counts |
