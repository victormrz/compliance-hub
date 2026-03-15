/**
 * Shared MSAL auth module for ComplianceHub SharePoint provisioning.
 * Uses device code flow — Victor runs manually, authenticates in browser.
 * Token is cached to disk so you only authenticate once per hour.
 */
import "isomorphic-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PublicClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_CACHE_PATH = path.join(__dirname, ".token-cache.json");

const TENANT_ID = "be7f6450-b41a-45e7-8995-23c2a419e1e6";
const CLIENT_ID = "651dbe03-ed62-44b3-a6a9-0151359eb775";
const SITE_HOST = "roaringbrookrecovery.sharepoint.com";
const SITE_PATH = "/sites/ComplianceHub";

const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
  },
};

const scopes = [
  "https://graph.microsoft.com/Sites.Manage.All",
  "https://graph.microsoft.com/Sites.ReadWrite.All",
  "https://graph.microsoft.com/Files.ReadWrite.All",
  "https://graph.microsoft.com/User.Read.All",
];

/**
 * Load cached token from disk if still valid.
 */
function loadCachedToken() {
  try {
    if (fs.existsSync(TOKEN_CACHE_PATH)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_CACHE_PATH, "utf8"));
      if (data.accessToken && new Date(data.expiresOn) > new Date()) {
        return data;
      }
    }
  } catch {
    // Ignore corrupt cache
  }
  return null;
}

/**
 * Save token to disk for reuse across script runs.
 */
function saveCachedToken(result) {
  const data = {
    accessToken: result.accessToken,
    expiresOn: result.expiresOn.toISOString(),
    account: { username: result.account.username },
  };
  fs.writeFileSync(TOKEN_CACHE_PATH, JSON.stringify(data, null, 2));
}

/**
 * Authenticate via device code flow and return an access token.
 * Reuses cached token from disk if still valid.
 */
export async function getAccessToken() {
  // Check disk cache first
  const cached = loadCachedToken();
  if (cached) {
    console.log(`Using cached token for: ${cached.account.username}`);
    return cached.accessToken;
  }

  const pca = new PublicClientApplication(msalConfig);

  const deviceCodeRequest = {
    scopes,
    deviceCodeCallback: (response) => {
      console.log("\n========================================");
      console.log("AUTHENTICATION REQUIRED");
      console.log("========================================");
      console.log(response.message);
      console.log("========================================\n");
    },
  };

  const result = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
  saveCachedToken(result);
  console.log(`Authenticated as: ${result.account.username}`);
  return result.accessToken;
}

/**
 * Get an authenticated Microsoft Graph client.
 */
export async function getGraphClient() {
  const token = await getAccessToken();
  return Client.init({
    authProvider: (done) => done(null, token),
  });
}

/**
 * Get the SharePoint site ID for ComplianceHub.
 */
export async function getSiteId(client) {
  const site = await client
    .api(`/sites/${SITE_HOST}:${SITE_PATH}`)
    .get();
  console.log(`Site ID: ${site.id}`);
  return site.id;
}

export { SITE_HOST, SITE_PATH };
