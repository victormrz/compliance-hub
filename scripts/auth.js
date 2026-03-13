/**
 * Shared MSAL auth module for ComplianceHub SharePoint provisioning.
 * Uses device code flow — Victor runs manually, authenticates in browser.
 */
import "isomorphic-fetch";
import { PublicClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";

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
];

let cachedToken = null;

/**
 * Authenticate via device code flow and return an access token.
 */
export async function getAccessToken() {
  if (cachedToken && cachedToken.expiresOn > new Date()) {
    return cachedToken.accessToken;
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
  cachedToken = result;
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
