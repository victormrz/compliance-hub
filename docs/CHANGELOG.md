# ComplianceHub — Changelog

All notable changes to this project are logged here by session date.

---

## 2026-03-13 — Session 4: Enterprise Build — Real Data + New Pages + Production Hardening

### Seed Data Created (Phase 1 ✅)
- `src/data/seeds/standards.json` — 169 CARF/TJC/State/Federal standards
- `src/data/seeds/policies.json` — 63 policies with HR-XX/TS-XX numbers
- `src/data/seeds/training.json` — 23 Appendix C training requirements
- `src/data/seeds/tasks.json` — 46 Appendix B operational timelines
- `src/data/seeds/crosswalk.json` — 20 cross-body requirement mappings

### Core Data Layer Rewrite (Phase 2 ✅)
- `src/data/mockData.js` — Imports from seed JSON, adds crosswalk + evidence exports
- Fixed KAR references: `902 KAR 20:036` → `908 KAR 1:370` / `908 KAR 1:372`
- Fixed body strings: all now use `CARF`, `TJC`, `KY-DBHDID`, `Federal`
- Role-based assignment (not individual names)
- `src/hooks/useAccreditation.jsx` — Fixed state filter (no longer catches Federal 42 CFR)

### Page Fixes (Phase 2 ✅)
- Dashboard.jsx — Switched from direct imports to useSharePointData hooks
- Training.jsx — Added trainingRecords hook, ProvidedTo/CompetencyBased fields
- Policies.jsx — Added PolicyNumber field, ownerRole select dropdown
- Standards.jsx — Updated body options, added section and requirementType fields

### New Pages (Phase 5)
- `src/pages/Crosswalk.jsx` — Cross-body requirement mapping view
- `src/pages/Evidence.jsx` — Document evidence tracker with status (Current/Missing/Outdated)
- Added routes to App.jsx, nav items to Layout.jsx, permissions to roles.js

### Graph API + Forms (Phase 3 ✅)
- `src/lib/graphService.js` — Added 7 new list CRUD functions (Crosswalk, Evidence, etc.)
- `src/components/FormModal.jsx` — Enhanced with pattern validation and custom validate callbacks

### SharePoint Provisioning Scripts (Phase 4)
- `scripts/createLists.js` — Creates 19 SharePoint lists with all columns per SCHEMA_MAP.md
- `scripts/loadSeedData.js` — Loads seed data in dependency order with retry logic
- `scripts/auth.js` — Shared MSAL device code auth module

### Production Hardening (Phase 6)
- `src/components/ErrorBoundary.jsx` — Catches render errors, prevents full app crash
- `src/components/ExportButton.jsx` — CSV export for any data table (admin/manager only)
- `src/components/LoadingSkeleton.jsx` — Animated loading placeholders
- `src/lib/exportUtils.js` — CSV/JSON export utilities with BOM for Excel

---

## 2026-03-13 — Session 3: CARF Data Deep-Dive + Schema Revision

### CARF 2025 Analysis Complete
- Downloaded full CARF 2025 folder (514 files, 97MB) to `reference/carf-2025/`
- Added `reference/` to `.gitignore` (production data, not for public repo)
- Analyzed CARF COMPLIANCE ASSIGNMENT SHEET.xlsx: 45 tasks with policy/standard mappings
- Analyzed Appendix A (Required Written Documentation): ~80 standards requiring written docs
- Analyzed Appendix B (Operational Timelines): 46 recurring tasks (30 annual, 2 quarterly, 2 monthly, etc.)
- Analyzed Appendix C (Required Training): 23 training requirements with audience, competency, frequency
- Mapped all 24 section folders with file counts (360+ evidence documents)
- Inventoried Policies folder: 28 HR policies (HR-00 to HR-28) + 31 TS policies (TS-01 to TS-31)

### Schema Revision (SCHEMA_MAP.md v2)
- Expanded from 16 to 19 SharePoint lists (+155 columns)
- Added **Crosswalk** list — maps equivalent requirements across CARF/TJC/State/Federal
- Added **ProgramApplicability** list — tags which LOC each standard applies to
- Added **Evidence** list — tracks proof documents per sub-standard
- Enhanced Training list with Appendix C fields (ProvidedTo, CompetencyBased)
- Added PolicyNumber (HR-XX/TS-XX) to Policies list
- Switched to role-based assignment (ComplianceRole) instead of individual names
- Fixed Body choices: CARF, TJC, KY-DBHDID, Federal-HIPAA, Federal-42CFR2

### Created ROADMAP.md
- Full implementation roadmap from current state to production

### Files Modified
- `SCHEMA_MAP.md` — Complete rewrite (v2)
- `docs/CHANGELOG.md` — This entry
- `docs/SKILLS.md` — Updated next steps
- `docs/LESSONS.md` — Added lessons from CARF analysis

---

## 2026-03-13 — Session 2: Deployment + Custom Domain + Data Architecture

### Deployment
- Deployed to GitHub Pages via GitHub Actions CI/CD
- Created `.github/workflows/deploy.yml` with build secrets
- Added `.npmrc` for Vite 8 / Tailwind CSS v4 peer dependency fix
- Made repo public (GitHub Pages requires it on free plan)
- Set up custom domain: **compliance.roaringbrookrecovery.com**
  - GoDaddy CNAME: `compliance` → `victormrz.github.io`
  - `public/CNAME` file for build persistence
  - `vite.config.js` base path set to `/`
  - `VITE_REDIRECT_URI` GitHub secret updated
  - Azure AD redirect URI added (now 3 total: localhost, github.io, custom domain)

### Data Architecture Research
- Explored CARF 2025 folder in `Roaring Brook Clinical Team > Documents > General > CARF 2025`
  - 23 section folders (1A through 3P) + 9 topic folders + 14 root-level files
  - Found CARF COMPLIANCE ASSIGNMENT SHEET.xlsx — existing task tracker
- Researched CARF and TJC standard structures for behavioral health
- Key finding: mock data used wrong KAR reference (`902 KAR 20:036` is personal care homes)
  - Correct references: `908 KAR 1:370` (general AODE) + `908 KAR 1:372` (residential)
- Identified need for crosswalk layer (CARF ↔ TJC ↔ State ↔ Federal mapping)
- Identified need for program-level applicability (which standards apply to which LOC)

### Files Created
- `SCHEMA_MAP.md` — SharePoint list schema (needs revision based on research)
- `docs/CHANGELOG.md` — this file
- `docs/ARCHITECTURE.md` — data model decisions and research findings
- `docs/LESSONS.md` — lessons learned for future sessions
- `docs/SKILLS.md` — build skills and context for session continuity

### Commits
1. `a581b30` — Add GitHub Pages deployment via Actions
2. `488b68f` — Add .npmrc for legacy-peer-deps in CI
3. `b17a1f9` — Configure custom domain compliance.roaringbrookrecovery.com

---

## 2026-03-12 — Session 1: Initial Build

### App Built
- React 19 + Vite 8 + Tailwind CSS v4 frontend
- MSAL auth with Azure AD (single tenant, Roaring Brook Recovery)
- 15 pages: Dashboard, Facilities, Licenses, EOC Inspections, Ligature Risk, Daily Staffing, Personnel, Credentialing, Training, Policies, Incidents, Standards, Regulatory Changes, Audit Trail, Data Backup
- Role-based access control (admin, manager, end_user, viewer)
- FormModal with input validation and sanitization
- SharePoint CRUD service (`graphService.js`) with audit logging hook
- All pages running on mock data (`mockData.js`)
- Security audit completed (CSP headers, XSS protection, input sanitization)
- GitHub repo: https://github.com/victormrz/compliance-hub (public)
- Created Gamma onboarding tutorial

### Azure AD Setup
- App Registration: ComplianceHub (SPA, single tenant)
- Client ID: 651dbe03-ed62-44b3-a6a9-0151359eb775
- Tenant ID: be7f6450-b41a-45e7-8995-23c2a419e1e6
- API Permissions: Microsoft Graph (User.Read, Sites.ReadWrite.All, Files.ReadWrite.All)
