/**
 * Bulk upload policy documents to SharePoint document library.
 * Uploads all .docx and .pdf files from the CARF policies folder
 * to /Policies/ in the ComplianceHub site's document library.
 *
 * Usage: cd scripts && node uploadPolicies.js
 */
import fs from "fs";
import path from "path";
import { getGraphClient, getSiteId } from "./auth.js";

const POLICIES_DIR =
  "/Users/victor/Desktop/CARF 2025/Policies & Procedures (as of 11.2021)";
const SHAREPOINT_FOLDER = "Policies";
const ALLOWED_EXTENSIONS = new Set([".docx", ".pdf", ".pptx"]);

async function uploadPolicies() {
  console.log("Starting policy document upload...\n");

  // Authenticate
  const client = await getGraphClient();
  const siteId = await getSiteId(client);

  // Read local files
  const allFiles = fs.readdirSync(POLICIES_DIR);
  const uploadableFiles = allFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    const fullPath = path.join(POLICIES_DIR, f);
    // Skip directories and non-document files
    return ALLOWED_EXTENSIONS.has(ext) && fs.statSync(fullPath).isFile();
  });

  console.log(`Found ${uploadableFiles.length} documents to upload.\n`);

  let uploaded = 0;
  let failed = 0;

  for (const fileName of uploadableFiles) {
    const filePath = path.join(POLICIES_DIR, fileName);
    const fileBuffer = fs.readFileSync(filePath);
    const sizeKB = (fileBuffer.length / 1024).toFixed(1);

    try {
      await client
        .api(
          `/sites/${siteId}/drive/root:/${SHAREPOINT_FOLDER}/${fileName}:/content`
        )
        .putStream(fileBuffer);

      uploaded++;
      console.log(
        `[${uploaded}/${uploadableFiles.length}] ✓ ${fileName} (${sizeKB} KB)`
      );
    } catch (err) {
      failed++;
      console.error(
        `[FAIL] ${fileName}: ${err.message || err.statusCode || err}`
      );
    }

    // Small delay to avoid throttling
    if (uploaded % 10 === 0) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\n========================================`);
  console.log(`Upload complete: ${uploaded} succeeded, ${failed} failed`);
  console.log(`========================================\n`);

  // Try to enable versioning on the document library
  try {
    console.log("Enabling versioning on document library...");
    await client.api(`/sites/${siteId}/drive`).patch({
      versioningConfiguration: {
        majorVersionLimit: 50,
      },
    });
    console.log("✓ Versioning enabled (up to 50 major versions).");
  } catch (err) {
    console.warn(
      "⚠ Could not enable versioning via API. Enable it manually:"
    );
    console.warn(
      "  SharePoint > Site Settings > Document Library Settings > Versioning"
    );
    console.warn(`  Error: ${err.message || err}`);
  }
}

uploadPolicies().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
