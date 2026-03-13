# ComplianceHub — Deploy & User Management Guide

## Quick Start (Local Dev)
```bash
cd compliance-hub
npm install --legacy-peer-deps
npm run dev
# Open http://localhost:5173
```

## Adding Users

### Step 1: Create Microsoft 365 Accounts
Users need @roaringbrookrecovery.com accounts in Azure AD / Microsoft 365 Admin Center:
1. Go to https://admin.microsoft.com
2. Users > Active users > Add a user
3. Assign Microsoft 365 license (needed for SharePoint access)

### Step 2: Assign Roles in ComplianceHub
Edit `src/lib/roles.js` and add email addresses to the `roleAssignments` map:

```js
export const roleAssignments = {
  // Admins
  'victor@roaringbrookrecovery.com': 'admin',

  // Managers
  'sarah.williams@roaringbrookrecovery.com': 'manager',
  'jennifer.davis@roaringbrookrecovery.com': 'manager',

  // End Users — any @roaringbrookrecovery.com account not listed
  // gets 'end_user' role automatically
};
```

### Roles Overview

| Role | Nav Access | Create | Edit | Delete | Export |
|------|-----------|--------|------|--------|--------|
| **Admin** | All 12 pages | Yes (all) | Yes | Yes | Yes |
| **Manager** | All 12 pages | Yes (all) | Yes | No | Yes |
| **End User** | 8 pages | Limited (incidents, staffing) | No | No | No |
| **Viewer** | 3 pages | No | No | No | No |

### Step 3: Grant SharePoint Access
Users need access to the ComplianceHub SharePoint site:
1. Go to https://roaringbrookrecovery.sharepoint.com/sites/ComplianceHub
2. Settings (gear) > Site permissions > Invite people
3. Add users with "Member" or "Visitor" permissions

## Production Deploy

### Azure Static Web Apps (Recommended)
1. Build: `npm run build`
2. Deploy the `dist/` folder
3. Add production redirect URI in Azure AD App Registration:
   - Go to https://portal.azure.com > App registrations > ComplianceHub
   - Authentication > Add redirect URI: `https://your-production-url.com`
4. Update `.env` with production URL:
   ```
   VITE_REDIRECT_URI=https://your-production-url.com
   ```
5. Configure SPA fallback (all routes -> index.html)

### Environment Variables
```
VITE_AZURE_CLIENT_ID=651dbe03-ed62-44b3-a6a9-0151359eb775
VITE_AZURE_TENANT_ID=be7f6450-b41a-45e7-8995-23c2a419e1e6
VITE_SHAREPOINT_HOSTNAME=roaringbrookrecovery.sharepoint.com
VITE_SHAREPOINT_SITE_PATH=/sites/ComplianceHub
VITE_REDIRECT_URI=https://your-production-url.com
```

## Azure AD App Registration Info
- **App Name**: ComplianceHub
- **Client ID**: 651dbe03-ed62-44b3-a6a9-0151359eb775
- **Tenant ID**: be7f6450-b41a-45e7-8995-23c2a419e1e6
- **Type**: Single-page application (SPA)
- **Permissions**: User.Read, Sites.ReadWrite.All, Files.ReadWrite.All (all admin-consented)

## SharePoint Lists
These lists were created on the ComplianceHub site:
1. Standards
2. Policies
3. Incidents
4. Training
5. Personnel
6. Credentials
7. Licenses
8. EOCInspections
9. LigatureRisk

## Architecture
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: MSAL (Azure AD)
- **Backend**: SharePoint Online via Microsoft Graph API
- **Offline Mode**: Falls back to mock data when SharePoint unavailable
- **State**: React hooks (useSharePointData) with local fallback
