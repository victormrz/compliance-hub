import { LogLevel } from '@azure/msal-browser';

// Azure AD credentials — MUST be set via .env file
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;

if (!clientId || !tenantId) {
  console.error('ComplianceHub: Missing VITE_AZURE_CLIENT_ID or VITE_AZURE_TENANT_ID in .env');
}

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          default:
            break;
        }
      },
    },
  },
};

// Scopes for Microsoft Graph API
export const graphScopes = {
  login: ['User.Read'],
  sharepoint: ['Sites.ReadWrite.All'],
  files: ['Files.ReadWrite.All'],
  all: ['User.Read', 'Sites.ReadWrite.All', 'Files.ReadWrite.All'],
};

// SharePoint site info
export const sharepointConfig = {
  siteHostname: import.meta.env.VITE_SHAREPOINT_HOSTNAME,
  sitePath: import.meta.env.VITE_SHAREPOINT_SITE_PATH,
  get siteUrl() {
    return `https://${this.siteHostname}${this.sitePath}`;
  },
};
