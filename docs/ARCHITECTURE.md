# ComplianceHub — Data Architecture

> Revised based on CARF/TJC/State/Federal research (2026-03-13)

---

## Regulatory Stack (Most Restrictive Wins)

```
Layer 1 (Federal):       HIPAA (45 CFR 164) + 42 CFR Part 2
Layer 2 (State):         908 KAR 1:370 (general AODE) + 908 KAR 1:372 (residential)
Layer 3 (Accreditation): CARF BH Standards Manual + TJC CAMBHC
```

Each layer adds requirements. The facility must meet the **most restrictive** across all layers.

---

## Standard Numbering Systems

### CARF
```
Section.Subsection.Standard
Example: 1.A.3 = Section 1, Subsection A (Leadership), Standard 3
```
- Section 1 (ASPIRE): Organization-level, applies to ALL programs
- Section 2: Behavioral Health General, applies to all BH programs
- Section 3+: Program-specific (RT, OT, IOP, PH, CH)

### TJC
```
Chapter.Major.Minor.Sub → Elements of Performance (EPs)
Example: CTS.02.01.09 → EP 1, EP 2, EP 3...
```
Chapters: CTS, PE (was EC+LS), EM, HRM, IC, IM, LD, PI, RC, RI, WT, NPSG

### State (Kentucky)
```
Title KAR Chapter:Section
Example: 908 KAR 1:370 Section 12
```

### Federal
```
CFR Part.Section
Example: 42 CFR 2.31, 45 CFR 164.312
```

---

## Programs / Levels of Care

| Program | CARF Standards Applied | ASAM Level |
|---------|----------------------|------------|
| SUD Residential (RT) | Section 1 + 2 + RT | 3.1 / 3.5 |
| IOP | Section 1 + 2 + IOP | 2.1 |
| PHP | Section 1 + 2 + PH | 2.5 |
| Sober Living (CH) | Section 1 + 2 + CH | — |

CARF accredits each program separately. TJC accredits all at once.

---

## Revised Entity Model

### Tier 1: Regulatory Framework (Reference Data)

```
AccreditationBody
  id, name, abbreviation
  Examples: CARF, TJC, KY DBHDID, Federal (HHS)

StandardFramework
  id, bodyId, name, version, effectiveDate, expirationDate
  Example: "2025 CARF BH Manual", effective Jul 2025 - Jun 2026

StandardSection
  id, frameworkId, code, name, parentSectionId
  Examples: "Section 1", "1.A", "1.A - Leadership"
  Note: Hierarchical — sections contain subsections

Standard
  id, sectionId, code, name, description
  Examples: "1.A.3", "CTS.02.01.09", "908 KAR 1:372 Sec 12"

Requirement (atomic compliance unit)
  id, standardId, code, description, evidenceTypes
  For TJC: these are Elements of Performance (EPs)
  For CARF: these are sub-items under each standard
  For State: these are specific provisions within a KAR section
```

### Tier 2: Crosswalk & Applicability

```
RequirementCrosswalk
  id, requirementId_A, requirementId_B, mappingNotes
  Maps equivalent requirements across bodies
  Example: CARF 1.H.3 ↔ TJC PE.02.01.01 EP 4 ↔ 908 KAR 1:372 Sec 8

ProgramApplicability
  id, standardId, programType
  Tags which standards apply to which levels of care
  Example: Standard "RT.01" applies to program "SUD Residential" only
  Example: Standard "1.A.1" applies to ALL programs
```

### Tier 3: Organizational (What Roaring Brook Has)

```
Facility
  id, name, type, address, status, beds, licenseNumber

Program
  id, facilityId, name, type (RT/IOP/PHP/CH), asamLevel, status

Personnel
  id, name, title, department, phone, hireDate, supervisor, status

Credential
  id, personnelId, type, issuingBody, number, issueDate, expirationDate, status
```

### Tier 4: Compliance Operations (What People Do)

```
Policy
  id, title, category, version, owner, lastReviewed, nextReview, status
  documentUrl (link to OneDrive/SharePoint file)

PolicyRequirementMap
  id, policyId, requirementId
  "This policy satisfies this requirement"
  One policy can satisfy many requirements across multiple bodies

ComplianceTask
  id, title, requirementId, policyId (optional), assignedTo,
  frequency, dueDate, completedDate, status, priority, category
  evidenceUrl (link to uploaded proof)

TrainingCourse
  id, name, category, frequency, duration, status

TrainingRecord
  id, personnelId, courseId, dueDate, completedDate, status

Incident
  id, date, type, facilityId, severity, reportedBy, description,
  investigationStatus, correctiveAction, rootCause, standardRef

Evidence
  id, requirementId, taskId (optional), type, documentUrl,
  uploadedBy, uploadedDate, description
  "This document proves compliance with this requirement"
```

### Tier 5: Monitoring

```
RegulatoryChange
  id, bodyId, changeType, title, description, impactedStandards,
  actionRequired, dueDate, assignedTo, status, priority

AuditLog
  id, timestamp, action, entity, recordId, userName, changes

Contract
  id, vendor, type, startDate, endDate, autoRenew, annualValue, status, owner
```

---

## Relationship Diagram

```
AccreditationBody ──> StandardFramework ──> StandardSection ──> Standard ──> Requirement
                                                                    |              |
                                                                    |    RequirementCrosswalk
                                                                    |        (maps across bodies)
                                                                    |              |
                                                             ProgramApplicability  |
                                                                    |              |
                                                                 Program           |
                                                                    |              |
Policy ──────────────── PolicyRequirementMap ──────────────── Requirement
   |                                                               |
   |                                                          ComplianceTask ──> Personnel
   |                                                               |
   +── documentUrl (OneDrive)                                  Evidence
                                                                   |
                                                              documentUrl (OneDrive)
```

---

## SharePoint Implementation Strategy

### What becomes a SharePoint List vs. stays as reference data

**SharePoint Lists (live CRUD via app):**
- Facilities, Programs, Personnel, Credentials
- Policies, ComplianceTasks, Evidence
- TrainingCourses, TrainingRecords
- Incidents, RegulatoryChanges, Contracts
- AuditLog (auto-populated)

**Embedded reference data (loaded into app, rarely changes):**
- AccreditationBodies (hardcoded — only 4)
- StandardFrameworks (hardcoded per manual version)
- Standards + Requirements (loaded from reference files, updated annually when manuals change)
- RequirementCrosswalk (maintained as reference data, updated when standards change)
- ProgramApplicability (maintained as reference data)

### Why not put Standards in SharePoint?

Standards are reference data that changes once a year when new manuals are published. Putting them in SharePoint would mean:
- Manual data entry of hundreds of standards
- Risk of accidental modification
- No version control

Better approach: Store standards as structured JSON/CSV in the codebase, loaded at build time. When manuals update annually, update the reference files and rebuild.

---

## Migration Path from Mock Data

### Phase 1: Fix Reference Data
- Replace mock standards with real CARF sections from the CARF 2025 folder
- Add TJC chapter/standard codes
- Fix KAR references (908 KAR 1:370/372, not 902 KAR 20:036)
- Add program applicability tags

### Phase 2: Create SharePoint Lists
- Create operational lists (Facilities, Personnel, Policies, Tasks, etc.)
- Do NOT create Standards as a SharePoint list — keep as reference data

### Phase 3: Load Real Data
- Import from CARF COMPLIANCE ASSIGNMENT SHEET.xlsx → ComplianceTasks
- Import from Policies & Procedures folder → Policies
- Import personnel from Staff Roster
- Map policies to requirements (PolicyRequirementMap)

### Phase 4: Wire Up App
- Replace mock imports with Graph API calls per page
- Enable real CRUD operations
- Remove test mode bypass
- Go live with real data
