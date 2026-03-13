# ComplianceHub — Lessons Learned

> Things that went wrong or could go wrong. Read this before every session.

---

## Deployment

1. **GitHub Pages requires public repo on free plan.** We made the repo public. If this becomes a concern, migrate to Vercel or Cloudflare Pages (both support private repos on free tier).

2. **Vite 8 + @tailwindcss/vite peer dependency conflict.** `npm ci` fails in CI without `.npmrc` containing `legacy-peer-deps=true`. Do not remove this file.

3. **Azure Portal DIV buttons.** Azure Portal uses `<div class="fxs-button">` instead of real `<button>` elements. Standard click coordinates fail. Use JavaScript: `document.querySelectorAll('div.fxs-button')` to find and `.click()`.

4. **SPA routing on GitHub Pages.** GitHub Pages doesn't support client-side routing natively. The deploy workflow copies `index.html` to `404.html` so all routes serve the SPA. Do not remove this step from `deploy.yml`.

5. **Custom domain + base path.** With custom domain, `vite.config.js` base must be `/` (not `/compliance-hub/`). The CNAME file must be in `public/` so Vite includes it in the build output.

---

## Data Model

6. **Wrong KAR reference in mock data.** `902 KAR 20:036` is for personal care homes, NOT SUD treatment. Correct references are `908 KAR 1:370` (general AODE requirements) and `908 KAR 1:372` (residential AODE licensure). Fix this when replacing mock data.

7. **CARF accredits programs, TJC accredits organizations.** This fundamentally affects the data model. Standards must be tagged with which programs/levels of care they apply to (RT, IOP, PHP, CH). A single "Standards" table is not enough — need a program applicability layer.

8. **42 CFR Part 2 Final Rule compliance deadline: February 16, 2026.** The new rule aligns Part 2 with HIPAA and allows single consent for TPO. Consent forms and privacy practices must be updated. This is ALREADY past due as of this build date.

9. **All cross-references use string-based lookups.** No SharePoint lookup columns, no foreign key enforcement. This is intentional for portability but means data integrity depends on the app's form validation (dropdowns, not free text for reference fields).

10. **CARF 2025 folder exists in production SharePoint.** Located at `Roaring Brook Clinical Team > Documents > General > CARF 2025`. This is production data — DO NOT modify, delete, or reorganize these files. Read-only access for reference.

---

## Azure / Auth

11. **No Azure subscription.** The Roaring Brook tenant only has M365 (Azure AD for auth). No Azure hosting available. That's why we're on GitHub Pages.

12. **Three redirect URIs in Azure AD.** `http://localhost:5173`, `https://victormrz.github.io/compliance-hub/`, `https://compliance.roaringbrookrecovery.com`. All three must stay for dev + legacy + production.

13. **GHL API scope is contacts-only.** Cannot read pipelines, workflows, or custom fields via API. GHL workflow/custom field pages are blocked by cross-origin iframes in browser automation.

---

## Build Process

14. **Mock data is the single source of truth for current UI.** Every page imports from `src/data/mockData.js`. The SharePoint CRUD functions exist in `graphService.js` but no page calls them yet. When wiring up live data, each page needs to switch from mock imports to the `useSharePointData` hook.

15. **SharePoint site exists but is empty.** `roaringbrookrecovery.sharepoint.com/sites/ComplianceHub` has no lists and an empty document library. Lists need to be created before live data works.

16. **Test mode bypass exists.** `?test=1` URL param bypasses auth in DEV mode. Must be removed before production use with real data.

---

## CARF 2025 Analysis

17. **Section sub-folders ARE the evidence mapping.** Each section folder (1A, 1H, etc.) contains sub-standard folders (1.H.1, 1.H.4, etc.) which contain copies of relevant policies as evidence. This manual crosswalk IS the current compliance tracking system — the app needs to digitize it, not replace it.

18. **Policies use HR-XX / TS-XX numbering.** 28 HR policies + 31 TS policies. This numbering system is already embedded in the Assignment Sheet and Appendix references. Preserve it as PolicyNumber in the Policies list.

19. **Assignment Sheet has outdated staff names.** Task assignments reference people who may no longer be at the organization. Switch to role-based assignment (Clinical Director, Safety Officer, etc.) so the system survives staff turnover.

20. **Appendix C training requirements are sparse on frequency.** Most say "None specified" — meaning the org decides. Only a few are mandated (1.H.4 = "Orientation and at least annually", 2.A.29 = "Upon hire and at least annually"). The app should default to "Org-Determined" and let staff set specific intervals.

21. **Section 3 is program-specific.** 3.M = IOP (6 files), 3.O = OT (2 files), 3.P = PHP (7 files). Sections 1 and 2 apply to ALL programs. This is why ProgramApplicability list is needed — Section 3 standards only apply to their specific LOC.

22. **Policies folder is dated November 2021.** The policies may need significant updates. The app should track version history and flag policies older than 12 months for review.
