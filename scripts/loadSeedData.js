/**
 * loadSeedData.js — Loads seed JSON files into SharePoint lists via Graph API.
 *
 * Reads from: src/data/seeds/*.json
 * Loading order respects dependencies per SCHEMA_MAP.md.
 * Retries failed items up to 3 times.
 *
 * Usage: cd scripts && node loadSeedData.js
 */
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getGraphClient, getSiteId } from "./auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEEDS_DIR = join(__dirname, "..", "src", "data", "seeds");

const MAX_RETRIES = 3;
const BATCH_SIZE = 20; // Graph API batch limit

// ============================================================
// Loading order per SCHEMA_MAP.md dependency graph
// ============================================================

const LOADING_ORDER = [
  // Phase 1: no dependencies
  "Facilities",
  "Standards",
  "Personnel",
  // Phase 2: depends on Phase 1
  "Policies",
  "Training",
  "Credentials",
  "Licenses",
  "Contracts",
  // Phase 3: depends on Phase 2
  "Crosswalk",
  "ProgramApplicability",
  "ComplianceTasks",
  "TrainingRecords",
  "Evidence",
  "Incidents",
  "EOCInspections",
  "LigatureRisk",
  "DailyStaffing",
  "RegulatoryChanges",
  // Phase 4: auto-generated (skip AuditLog — populated by the app)
];

// ============================================================
// Map seed file names to SharePoint list names
// File names are lowercase/kebab versions of the list names.
// ============================================================

function seedFileToListName(filename) {
  // Remove .json extension
  const base = filename.replace(/\.json$/, "");

  // Direct mapping table for non-obvious names
  const MAP = {
    standards: "Standards",
    crosswalk: "Crosswalk",
    "program-applicability": "ProgramApplicability",
    programapplicability: "ProgramApplicability",
    policies: "Policies",
    "compliance-tasks": "ComplianceTasks",
    compliancetasks: "ComplianceTasks",
    training: "Training",
    "training-records": "TrainingRecords",
    trainingrecords: "TrainingRecords",
    facilities: "Facilities",
    licenses: "Licenses",
    personnel: "Personnel",
    credentials: "Credentials",
    incidents: "Incidents",
    evidence: "Evidence",
    "eoc-inspections": "EOCInspections",
    eocinspections: "EOCInspections",
    "ligature-risk": "LigatureRisk",
    ligaturerisk: "LigatureRisk",
    "daily-staffing": "DailyStaffing",
    dailystaffing: "DailyStaffing",
    "regulatory-changes": "RegulatoryChanges",
    regulatorychanges: "RegulatoryChanges",
    contracts: "Contracts",
    "audit-log": "AuditLog",
    auditlog: "AuditLog",
  };

  return MAP[base.toLowerCase()] || base;
}

// ============================================================
// Discover seed files and map to lists
// ============================================================

async function discoverSeedFiles() {
  let files;
  try {
    files = await readdir(SEEDS_DIR);
  } catch {
    console.error(`Seeds directory not found: ${SEEDS_DIR}`);
    console.error("Create seed JSON files in src/data/seeds/ first.");
    process.exit(1);
  }

  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const seedMap = new Map(); // listName -> filePath

  for (const f of jsonFiles) {
    const listName = seedFileToListName(f);
    seedMap.set(listName, join(SEEDS_DIR, f));
  }

  return seedMap;
}

// ============================================================
// Get list ID by display name
// ============================================================

async function getListId(client, siteId, listName) {
  try {
    const result = await client
      .api(`/sites/${siteId}/lists`)
      .filter(`displayName eq '${listName}'`)
      .select("id")
      .get();
    if (result.value.length > 0) return result.value[0].id;
  } catch {
    // fall through
  }
  return null;
}

// ============================================================
// Get column name mappings (display name -> internal name)
// ============================================================

async function getColumnMap(client, siteId, listId) {
  const result = await client
    .api(`/sites/${siteId}/lists/${listId}/columns`)
    .select("name,displayName")
    .top(100)
    .get();

  const map = new Map();
  for (const col of result.value) {
    // Map both displayName and name to the internal name
    map.set(col.displayName, col.name);
    map.set(col.name, col.name);
  }
  return map;
}

// ============================================================
// Transform a seed record's fields to SharePoint column names
// ============================================================

function transformRecord(record, columnMap) {
  const fields = {};

  for (const [key, value] of Object.entries(record)) {
    if (value === null || value === undefined) continue;

    // Check if the key maps to a known column
    const internalName = columnMap.get(key);
    if (internalName) {
      fields[internalName] = value;
    } else {
      // Try the key as-is (seed files may already use internal names)
      fields[key] = value;
    }
  }

  return fields;
}

// ============================================================
// Create items with retry
// ============================================================

async function createItemWithRetry(client, siteId, listId, fields, attempt = 1) {
  try {
    await client
      .api(`/sites/${siteId}/lists/${listId}/items`)
      .post({ fields });
    return true;
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      // Back off before retry
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return createItemWithRetry(client, siteId, listId, fields, attempt + 1);
    }
    throw err;
  }
}

// ============================================================
// Batch create via Graph $batch endpoint
// ============================================================

async function batchCreateItems(client, siteId, listId, itemsBatch) {
  const requests = itemsBatch.map((fields, idx) => ({
    id: String(idx + 1),
    method: "POST",
    url: `/sites/${siteId}/lists/${listId}/items`,
    headers: { "Content-Type": "application/json" },
    body: { fields },
  }));

  try {
    const result = await client.api("/$batch").post({ requests });
    const failed = [];
    for (const resp of result.responses) {
      if (resp.status >= 400) {
        const idx = parseInt(resp.id, 10) - 1;
        failed.push({ fields: itemsBatch[idx], error: resp.body?.error?.message || `HTTP ${resp.status}` });
      }
    }
    return failed;
  } catch {
    // Batch endpoint failed entirely — return all as failed for sequential fallback
    return itemsBatch.map((fields) => ({ fields, error: "Batch request failed" }));
  }
}

// ============================================================
// Load a single list's seed data
// ============================================================

async function loadListSeed(client, siteId, listName, filePath) {
  const listId = await getListId(client, siteId, listName);
  if (!listId) {
    console.log(`  SKIP  "${listName}" — list not found in SharePoint`);
    return { loaded: 0, errors: 0 };
  }

  // Read seed file
  const raw = await readFile(filePath, "utf-8");
  let records;
  try {
    records = JSON.parse(raw);
  } catch {
    console.error(`  ERROR  "${listName}" — invalid JSON in ${filePath}`);
    return { loaded: 0, errors: 0 };
  }

  if (!Array.isArray(records) || records.length === 0) {
    console.log(`  SKIP  "${listName}" — no records in seed file`);
    return { loaded: 0, errors: 0 };
  }

  // Get column mappings
  const columnMap = await getColumnMap(client, siteId, listId);

  // Transform all records
  const transformed = records.map((r) => transformRecord(r, columnMap));

  let loaded = 0;
  let errors = 0;

  // Try batch first, fall back to sequential for failures
  for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
    const batch = transformed.slice(i, i + BATCH_SIZE);
    const failed = await batchCreateItems(client, siteId, listId, batch);

    loaded += batch.length - failed.length;

    // Retry failures sequentially
    for (const { fields, error } of failed) {
      try {
        await createItemWithRetry(client, siteId, listId, fields);
        loaded++;
      } catch (err) {
        errors++;
        const title = fields.Title || fields.title || "(no title)";
        console.error(
          `    FAIL  item "${title}": ${err.message}`
        );
      }
    }

    // Progress for large sets
    if (transformed.length > BATCH_SIZE) {
      const progress = Math.min(i + BATCH_SIZE, transformed.length);
      process.stdout.write(
        `\r         Progress: ${progress}/${transformed.length}`
      );
    }
  }

  if (transformed.length > BATCH_SIZE) {
    process.stdout.write("\n");
  }

  console.log(
    `         ${loaded} loaded, ${errors} errors (${records.length} total in seed)`
  );

  return { loaded, errors };
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("ComplianceHub — Seed Data Loader");
  console.log("================================\n");

  const client = await getGraphClient();
  const siteId = await getSiteId(client);

  const seedMap = await discoverSeedFiles();

  console.log(`\nFound ${seedMap.size} seed file(s) in ${SEEDS_DIR}`);
  console.log(`Loading in dependency order...\n`);

  const totals = { loaded: 0, errors: 0, skipped: 0 };

  for (const listName of LOADING_ORDER) {
    const filePath = seedMap.get(listName);
    if (!filePath) {
      // No seed file for this list — skip silently
      continue;
    }

    console.log(`  LOAD  "${listName}" from ${filePath.split("/seeds/")[1]}`);
    const { loaded, errors } = await loadListSeed(
      client,
      siteId,
      listName,
      filePath
    );
    totals.loaded += loaded;
    totals.errors += errors;
  }

  // Load any seed files that weren't in the ordered list
  for (const [listName, filePath] of seedMap) {
    if (!LOADING_ORDER.includes(listName)) {
      console.log(
        `  LOAD  "${listName}" (unordered) from ${filePath.split("/seeds/")[1]}`
      );
      const { loaded, errors } = await loadListSeed(
        client,
        siteId,
        listName,
        filePath
      );
      totals.loaded += loaded;
      totals.errors += errors;
    }
  }

  console.log("\n================================");
  console.log("DONE");
  console.log(
    `  Loaded: ${totals.loaded}  Errors: ${totals.errors}`
  );
  console.log("================================");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
