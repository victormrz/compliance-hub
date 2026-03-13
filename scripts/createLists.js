/**
 * createLists.js — Creates 19 SharePoint lists for ComplianceHub via Graph API.
 * Idempotent: checks if each list exists first, skips if so.
 *
 * Usage: cd scripts && npm install && node createLists.js
 */
import { getGraphClient, getSiteId } from "./auth.js";

// ============================================================
// Column builder helpers
// ============================================================

function textCol(name, required = false) {
  return { name, text: {}, required, description: "" };
}

function choiceCol(name, choices, required = false) {
  return {
    name,
    choice: { allowTextEntry: false, choices, displayAs: "dropDownMenu" },
    required,
  };
}

function dateCol(name, required = false) {
  return { name, dateTime: { format: "dateOnly" }, required };
}

function dateTimeCol(name, required = false) {
  return { name, dateTime: { format: "dateTimeShort" }, required };
}

function numberCol(name, required = false) {
  return { name, number: {}, required };
}

function currencyCol(name, required = false) {
  return { name, currency: { locale: "en-US" }, required };
}

function boolCol(name, required = false) {
  return { name, boolean: {}, required };
}

function noteCol(name, required = false) {
  return {
    name,
    text: { allowMultipleLines: true, textType: "plain" },
    required,
  };
}

// ============================================================
// Shared choice arrays
// ============================================================

const OWNER_ROLES = [
  "Executive Director",
  "Clinical Director",
  "Compliance Officer",
  "Safety Officer",
  "HR Director",
  "Medical Director",
  "Nursing Director",
  "IT Director",
  "QI Coordinator",
];

const BODY_CHOICES = [
  "CARF",
  "TJC",
  "KY-DBHDID",
  "Federal-HIPAA",
  "Federal-42CFR2",
];

const PRIORITY_CHOICES = ["Critical", "High", "Medium", "Low"];

// ============================================================
// All 19 list definitions
// ============================================================

const LIST_DEFINITIONS = [
  // LIST 1: Standards
  {
    displayName: "Standards",
    columns: [
      // Title is built-in
      textCol("StandardName", true),
      choiceCol("Body", BODY_CHOICES, true),
      textCol("Section", true),
      textCol("Category", true),
      choiceCol("RequirementType", [
        "Documentation",
        "Training",
        "Inspection",
        "Policy",
        "Reporting",
        "Assessment",
      ]),
      noteCol("EvidenceRequired"),
      choiceCol("Status", ["Active", "Inactive", "Under Review"], true),
    ],
  },

  // LIST 2: Crosswalk
  {
    displayName: "Crosswalk",
    columns: [
      textCol("CARFStandard"),
      textCol("TJCStandard"),
      textCol("StateRegulation"),
      textCol("FederalRegulation"),
      textCol("PolicyRef"),
      textCol("TrainingRef"),
      textCol("TaskRef"),
      choiceCol(
        "RequirementCategory",
        [
          "Safety",
          "Clinical",
          "HR",
          "Privacy",
          "Documentation",
          "Quality",
          "Rights",
          "Access",
        ],
        true
      ),
    ],
  },

  // LIST 3: ProgramApplicability
  {
    displayName: "ProgramApplicability",
    columns: [
      textCol("StandardRef", true),
      choiceCol(
        "Program",
        [
          "Residential Treatment (3.5)",
          "IOP (2.1)",
          "PHP (2.5)",
          "Collegiate Housing",
          "All Programs",
        ],
        true
      ),
      textCol("ASAMLevel"),
      choiceCol("CARFSection", [
        "Section 1 (all)",
        "Section 2 (all)",
        "Section 3.M (IOP)",
        "Section 3.O (OT)",
        "Section 3.P (PH)",
      ]),
      noteCol("Notes"),
    ],
  },

  // LIST 4: Policies
  {
    displayName: "Policies",
    columns: [
      textCol("PolicyNumber", true),
      choiceCol("PolicySeries", ["HR", "TS"], true),
      choiceCol(
        "Category",
        [
          "Clinical",
          "Compliance",
          "Safety",
          "HR",
          "Administrative",
          "Financial",
          "Technology",
          "Rights",
        ],
        true
      ),
      textCol("Version"),
      dateCol("LastReviewed"),
      dateCol("NextReview", true),
      choiceCol("OwnerRole", OWNER_ROLES, true),
      choiceCol(
        "Status",
        ["Current", "Review Due", "Draft", "Archived"],
        true
      ),
      textCol("StandardRefs"),
    ],
  },

  // LIST 5: ComplianceTasks
  {
    displayName: "ComplianceTasks",
    columns: [
      textCol("StandardRef", true),
      choiceCol("Body", ["CARF", "TJC", "State", "Federal"], true),
      choiceCol("AssignedToRole", OWNER_ROLES, true),
      dateCol("DueDate", true),
      choiceCol(
        "Status",
        ["Not Started", "In Progress", "Complete", "Overdue"],
        true
      ),
      choiceCol("Priority", PRIORITY_CHOICES, true),
      choiceCol(
        "Frequency",
        [
          "Annual",
          "Semi-Annual",
          "Quarterly",
          "Monthly",
          "Bi-Weekly",
          "Weekly",
          "Org-Determined",
          "One-Time",
        ],
        true
      ),
      dateCol("LastCompleted"),
      textCol("PolicyRef"),
      choiceCol("TaskCategory", [
        "Inspection",
        "Documentation",
        "Policy Review",
        "Audit",
        "Training",
        "Credentialing",
        "Quality Improvement",
        "Reporting",
        "Assessment",
      ]),
      textCol("EvidenceLocation"),
    ],
  },

  // LIST 6: Training
  {
    displayName: "Training",
    columns: [
      textCol("StandardRef", true),
      choiceCol(
        "Category",
        ["Safety", "Clinical", "Compliance", "HR", "Leadership", "Technology"],
        true
      ),
      choiceCol(
        "ProvidedTo",
        [
          "Personnel",
          "Persons Served",
          "Personnel and Persons Served",
          "Volunteers",
          "All Stakeholders",
        ],
        true
      ),
      boolCol("CompetencyBased", true),
      choiceCol(
        "Frequency",
        [
          "Orientation Only",
          "Orientation and Annually",
          "Annual",
          "Initial and Ongoing",
          "As Needed",
          "None Specified",
        ],
        true
      ),
      textCol("Duration"),
      choiceCol("Status", ["Active", "Draft", "Archived"], true),
    ],
  },

  // LIST 7: TrainingRecords
  {
    displayName: "TrainingRecords",
    columns: [
      textCol("CourseName", true),
      dateCol("DueDate", true),
      dateCol("CompletedDate"),
      boolCol("CompetencyVerified"),
      textCol("VerifiedBy"),
      choiceCol(
        "Status",
        ["Completed", "In Progress", "Overdue", "Not Started"],
        true
      ),
      textCol("Year"),
    ],
  },

  // LIST 8: Facilities
  {
    displayName: "Facilities",
    columns: [
      choiceCol(
        "FacilityType",
        ["SUD Residential", "IOP/PHP", "Sober Living"],
        true
      ),
      textCol("Address", true),
      choiceCol("Status", ["Active", "Inactive", "Pending"], true),
      numberCol("Beds"),
      textCol("LicenseNumber"),
      textCol("Programs"),
    ],
  },

  // LIST 9: Licenses
  {
    displayName: "Licenses",
    columns: [
      textCol("Facility", true),
      choiceCol(
        "LicenseType",
        [
          "State License",
          "Accreditation",
          "Safety Permit",
          "Health Permit",
          "Federal License",
          "Business License",
        ],
        true
      ),
      textCol("IssuingAuthority"),
      dateCol("IssueDate", true),
      dateCol("ExpirationDate", true),
      choiceCol("Status", ["Active", "Critical", "Expired"], true),
    ],
  },

  // LIST 10: Personnel
  {
    displayName: "Personnel",
    columns: [
      textCol("JobTitle", true),
      choiceCol("ComplianceRole", OWNER_ROLES),
      choiceCol(
        "Department",
        [
          "Management",
          "Clinical",
          "Nursing",
          "Operations",
          "Compliance",
          "Peer Support",
          "Administrative",
        ],
        true
      ),
      textCol("Phone"),
      dateCol("HireDate", true),
      textCol("Supervisor"),
      choiceCol("Status", ["Active", "On Leave", "Terminated"], true),
      boolCol("CredentialsComplete"),
      boolCol("TrainingComplete"),
    ],
  },

  // LIST 11: Credentials
  {
    displayName: "Credentials",
    columns: [
      choiceCol(
        "CredentialType",
        [
          "LPCC",
          "LCSW",
          "RN",
          "LPN",
          "MD/DO",
          "DEA",
          "NPI",
          "Board Cert",
          "Peer Support",
          "CPR/BLS",
          "CAQH",
          "Medicare",
          "Medicaid",
        ],
        true
      ),
      textCol("IssuingBody", true),
      textCol("CredentialNumber", true),
      dateCol("IssueDate"),
      dateCol("ExpirationDate"),
      choiceCol(
        "Status",
        ["Active", "Critical", "Expired", "Pending", "Revoked"],
        true
      ),
    ],
  },

  // LIST 12: Incidents
  {
    displayName: "Incidents",
    columns: [
      dateCol("IncidentDate", true),
      textCol("Facility", true),
      choiceCol("Severity", ["Minor", "Moderate", "Critical"], true),
      textCol("ReportedBy", true),
      noteCol("Description", true),
      choiceCol(
        "InvestigationStatus",
        ["Under Review", "RCA In Progress", "Resolved", "Closed"],
        true
      ),
      noteCol("CorrectiveAction"),
      dateCol("ResolutionDate"),
      textCol("RootCause"),
      textCol("StandardRef"),
    ],
  },

  // LIST 13: Evidence
  {
    displayName: "Evidence",
    columns: [
      textCol("StandardRef", true),
      choiceCol(
        "DocumentType",
        [
          "Policy",
          "Training Record",
          "Form",
          "Report",
          "Certificate",
          "Photo",
          "Meeting Minutes",
          "Plan",
          "Assessment",
        ],
        true
      ),
      textCol("PolicyRef"),
      textCol("FileLocation"),
      dateCol("UploadDate"),
      choiceCol(
        "Status",
        ["Current", "Outdated", "Missing", "Under Review"],
        true
      ),
    ],
  },

  // LIST 14: EOCInspections
  {
    displayName: "EOCInspections",
    columns: [
      choiceCol("InspectionType", ["Safety Walkthrough"], true),
      textCol("Area", true),
      textCol("Facility", true),
      dateCol("InspectionDate", true),
      textCol("Inspector", true),
      choiceCol(
        "Status",
        [
          "Scheduled",
          "Complete",
          "Deficiencies Found",
          "Corrective Action Needed",
        ],
        true
      ),
      noteCol("Findings"),
    ],
  },

  // LIST 15: LigatureRisk
  {
    displayName: "LigatureRisk",
    columns: [
      textCol("Facility", true),
      choiceCol("RiskLevel", ["Low", "Medium", "High", "Critical"], true),
      dateCol("AssessmentDate", true),
      textCol("AssessedBy", true),
      noteCol("Findings"),
      noteCol("Mitigation"),
      choiceCol("Status", ["Assessed", "Mitigated", "Needs Action"], true),
    ],
  },

  // LIST 16: DailyStaffing
  {
    displayName: "DailyStaffing",
    columns: [
      dateCol("ShiftDate", true),
      choiceCol("Shift", ["Day", "Evening", "Night"], true),
      numberCol("ClientCount", true),
      numberCol("ClinicalStaff", true),
      numberCol("NursingStaff"),
      numberCol("PeerSupport"),
      numberCol("TotalStaff"),
      boolCol("RatioMet"),
      noteCol("Notes"),
    ],
  },

  // LIST 17: RegulatoryChanges
  {
    displayName: "RegulatoryChanges",
    columns: [
      dateCol("ChangeDate", true),
      choiceCol("Body", BODY_CHOICES, true),
      choiceCol(
        "ChangeType",
        [
          "Standard Revision",
          "New Requirement",
          "Regulation Amendment",
          "Clarification",
          "Rule Change",
        ],
        true
      ),
      noteCol("Description", true),
      textCol("ImpactedStandards"),
      noteCol("ActionRequired"),
      dateCol("DueDate"),
      choiceCol("AssignedToRole", OWNER_ROLES),
      choiceCol("Status", ["Not Started", "In Progress", "Complete"], true),
      choiceCol("Priority", PRIORITY_CHOICES, true),
    ],
  },

  // LIST 18: Contracts
  {
    displayName: "Contracts",
    columns: [
      choiceCol(
        "ContractType",
        ["Software/SaaS", "BAA", "Service Agreement", "Vendor"],
        true
      ),
      dateCol("StartDate", true),
      dateCol("EndDate", true),
      boolCol("AutoRenew"),
      currencyCol("AnnualValue"),
      choiceCol(
        "Status",
        ["Active", "Expiring Soon", "Expired", "Terminated"],
        true
      ),
      choiceCol("OwnerRole", OWNER_ROLES),
    ],
  },

  // LIST 19: AuditLog
  {
    displayName: "AuditLog",
    columns: [
      dateTimeCol("Timestamp", true),
      choiceCol("Action", ["Create", "Update", "Delete"], true),
      textCol("Entity", true),
      textCol("RecordId", true),
      textCol("RecordName"),
      textCol("UserName", true),
      textCol("UserEmail"),
      choiceCol("UserRole", ["admin", "manager", "end_user", "viewer"]),
      noteCol("Changes"),
    ],
  },
];

// ============================================================
// Provisioning logic
// ============================================================

async function getExistingLists(client, siteId) {
  const result = await client
    .api(`/sites/${siteId}/lists`)
    .select("displayName,id")
    .top(50)
    .get();
  const map = new Map();
  for (const list of result.value) {
    map.set(list.displayName, list.id);
  }
  return map;
}

async function createList(client, siteId, displayName) {
  const body = {
    displayName,
    list: { template: "genericList" },
  };
  const result = await client.api(`/sites/${siteId}/lists`).post(body);
  return result.id;
}

async function addColumn(client, siteId, listId, colDef) {
  // Build the Graph columnDefinition payload
  const payload = { name: colDef.name, description: colDef.description || "" };

  if (colDef.required) {
    payload.required = true;
  }

  if (colDef.text) {
    if (colDef.text.allowMultipleLines) {
      // Note / multiline text
      payload.text = {
        allowMultipleLines: true,
        textType: colDef.text.textType || "plain",
        maxLength: 0, // unlimited
      };
    } else {
      payload.text = { allowMultipleLines: false, maxLength: 255 };
    }
  } else if (colDef.choice) {
    payload.choice = {
      allowTextEntry: colDef.choice.allowTextEntry || false,
      choices: colDef.choice.choices,
      displayAs: colDef.choice.displayAs || "dropDownMenu",
    };
  } else if (colDef.dateTime) {
    payload.dateTime = { format: colDef.dateTime.format || "dateOnly" };
  } else if (colDef.number !== undefined) {
    payload.number = { decimalPlaces: "none" };
  } else if (colDef.currency !== undefined) {
    payload.currency = { locale: colDef.currency.locale || "en-US" };
  } else if (colDef.boolean !== undefined) {
    payload.boolean = {};
  }

  await client.api(`/sites/${siteId}/lists/${listId}/columns`).post(payload);
}

async function getExistingColumns(client, siteId, listId) {
  const result = await client
    .api(`/sites/${siteId}/lists/${listId}/columns`)
    .select("name")
    .top(100)
    .get();
  return new Set(result.value.map((c) => c.name));
}

async function provisionList(client, siteId, listDef, existingLists) {
  const { displayName, columns } = listDef;

  // Check if list already exists
  let listId = existingLists.get(displayName);
  if (listId) {
    console.log(`  SKIP  "${displayName}" — already exists (${listId})`);
  } else {
    listId = await createList(client, siteId, displayName);
    console.log(`  CREATE "${displayName}" — ${listId}`);
  }

  // Add columns (skip any that already exist)
  const existingCols = await getExistingColumns(client, siteId, listId);
  let created = 0;
  let skipped = 0;

  for (const col of columns) {
    if (existingCols.has(col.name)) {
      skipped++;
      continue;
    }
    try {
      await addColumn(client, siteId, listId, col);
      created++;
    } catch (err) {
      console.error(
        `    ERROR adding column "${col.name}" to "${displayName}": ${err.message}`
      );
    }
  }

  console.log(
    `         Columns: ${created} created, ${skipped} skipped (already exist)`
  );
  return listId;
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("ComplianceHub — SharePoint List Provisioning");
  console.log("=============================================\n");

  const client = await getGraphClient();
  const siteId = await getSiteId(client);

  console.log("\nProvisioning 19 lists...\n");

  const existingLists = await getExistingLists(client, siteId);

  const results = { created: 0, skipped: 0, errors: 0 };

  for (const listDef of LIST_DEFINITIONS) {
    try {
      const existed = existingLists.has(listDef.displayName);
      await provisionList(client, siteId, listDef, existingLists);
      if (existed) results.skipped++;
      else results.created++;
    } catch (err) {
      console.error(
        `  FAIL  "${listDef.displayName}": ${err.message}`
      );
      results.errors++;
    }
  }

  console.log("\n=============================================");
  console.log("DONE");
  console.log(
    `  Created: ${results.created}  Skipped: ${results.skipped}  Errors: ${results.errors}`
  );
  console.log("=============================================");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
