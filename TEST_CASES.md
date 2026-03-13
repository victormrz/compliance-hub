# ComplianceHub — Test Cases

## Authentication Tests

### TC-AUTH-01: Microsoft Login Flow
1. Open http://localhost:5173
2. Verify Roaring Brook logo displays on login screen
3. Click "Sign in with Microsoft"
4. Complete Azure AD login with @roaringbrookrecovery.com account
5. **Expected**: Redirected to Dashboard, user name/role badge visible in sidebar

### TC-AUTH-02: Role Assignment - Admin
1. Login as victor@roaringbrookrecovery.com
2. **Expected**: Role badge shows "Admin" (red), all 12 nav items visible

### TC-AUTH-03: Role Assignment - End User
1. Login as any non-admin @roaringbrookrecovery.com account
2. **Expected**: Role badge shows "Staff", limited nav items (no Personnel, Credentialing, Policies, Licenses)

### TC-AUTH-04: Logout
1. Click LogOut icon in sidebar
2. **Expected**: Returns to login screen, localStorage cleared

### TC-AUTH-05: Offline Fallback
1. Open app without logging in (if possible) or disconnect SharePoint
2. **Expected**: All pages show "Offline" badge and load mock data

---

## Dashboard Tests

### TC-DASH-01: Stats Display
1. Navigate to Dashboard
2. **Expected**: Health score, expired licenses, open incidents, overdue trainings all display correct numbers from mock data

### TC-DASH-02: Accreditation Filter
1. Select "TJC" from top bar filter
2. **Expected**: All pages filter to show only TJC-related records

---

## CRUD Tests (per page)

### TC-CRUD-01: Standards — Create
1. Navigate to Standards Library
2. Click "Add Standard"
3. Fill form: Code=TEST.01, Name=Test Standard, Body=TJC, Category=Test, Status=Met
4. Click "Create"
5. **Expected**: New standard appears in table

### TC-CRUD-02: Standards — Edit
1. Click pencil icon on any standard
2. Change the name
3. Click "Update"
4. **Expected**: Table reflects updated name

### TC-CRUD-03: Standards — Search
1. Type "HIPAA" in search box
2. **Expected**: Only standards matching "HIPAA" shown

### TC-CRUD-04: Standards — Tab Filter
1. Click "TJC" tab
2. **Expected**: Only TJC standards shown

### TC-CRUD-05: Incidents — Create
1. Navigate to Incident Reporting
2. Click "Report Incident"
3. Fill: Date, Type=Fall, Facility, Severity=Medium, ReportedBy, Description
4. Click "Create"
5. **Expected**: New incident appears, stats update

### TC-CRUD-06: EOC Inspections — Create/Edit
1. Navigate to EOC Inspections
2. Click "New Inspection", fill form, create
3. Click pencil on created record, modify, update
4. **Expected**: Record created then updated successfully

### TC-CRUD-07: Ligature Risk — Create
1. Navigate to Ligature Risk
2. Click "New Assessment"
3. Fill: Location, Risk Level=High, Items=5, dates, CAP Status
4. **Expected**: New assessment in table, High Risk count updates

### TC-CRUD-08: Personnel — Create/Edit
1. Navigate to Personnel & HR
2. Click "Add Employee", fill form
3. Edit: credentials/training checkboxes toggle
4. **Expected**: Employee created, badges update

### TC-CRUD-09: Credentialing — Filter Tabs
1. Navigate to Credentialing
2. Click "Expired" tab
3. **Expected**: Only expired credentials shown
4. Click "Expiring Soon"
5. **Expected**: Only credentials with daysLeft <= 180 shown

### TC-CRUD-10: Training — Two Tabs
1. Navigate to Training
2. View "Training Courses" tab — verify courses list
3. Switch to "Training Records" — verify employee records
4. **Expected**: Both tabs render correctly

### TC-CRUD-11: Policies — Two Tabs
1. Navigate to Policies
2. View "Policy Register" — verify policies with owners, versions, standards
3. Switch to "OneDrive Files" — verify file list with import status
4. **Expected**: Both tabs render, imported/pending counts correct

### TC-CRUD-12: Daily Staffing — Auto-Calculate Ratio
1. Navigate to Daily Staffing
2. Click "Log Staffing"
3. Enter: Date, Day shift, 30 clients, 3 clinical, 2 nursing, 2 peers
4. **Expected**: Creates record with ratio 1:4.3, marked compliant

### TC-CRUD-13: Daily Staffing — Non-Compliant Alert
1. Log staffing with 30 clients, 1 clinical, 1 nursing, 0 peers
2. **Expected**: Ratio 1:15.0, marked non-compliant (red row)

### TC-CRUD-14: Licenses — Days Left Display
1. Navigate to Licenses
2. **Expected**: Expired licenses show negative days (red), critical < 30 days (red), warning < 90 (amber)

---

## SharePoint Integration Tests

### TC-SP-01: Live Data Fetch
1. Login with valid Azure AD account
2. Navigate to any page
3. **Expected**: "SharePoint" badge (green), data loads from SharePoint lists

### TC-SP-02: Create via SharePoint
1. While connected (SharePoint badge green)
2. Create a new record on any page
3. **Expected**: Record saved to SharePoint list and reflected in table

### TC-SP-03: Fallback to Mock
1. If SharePoint connection fails
2. **Expected**: "Offline" badge (amber), mock data displayed, CRUD works locally

---

## Role-Based Access Tests

### TC-ROLE-01: Admin Sees All
1. Login as admin
2. **Expected**: All 12 nav items, create/edit/delete buttons visible on all pages

### TC-ROLE-02: End User Limited Nav
1. Login as end_user
2. **Expected**: Only Dashboard, Facilities, EOC, Ligature Risk, Staffing, Training, Incidents, Standards visible
3. Create buttons only on Incidents and Staffing

### TC-ROLE-03: Viewer Read-Only
1. Login as viewer (assign role in roles.js)
2. **Expected**: Only Dashboard, Facilities, Standards visible
3. No create/edit/delete buttons

---

## UI/UX Tests

### TC-UI-01: Sidebar Collapse
1. Click collapse arrow in sidebar
2. **Expected**: Sidebar collapses to icons only, nav still works

### TC-UI-02: Search Across All Pages
1. On each page, type in search box
2. **Expected**: Table filters correctly by all searchable fields

### TC-UI-03: Empty State
1. Search for non-existent term on any page
2. **Expected**: Empty state with icon and "No [items] found" message

### TC-UI-04: Loading State
1. Slow network / SharePoint loading
2. **Expected**: Indigo spinner displayed while data loads

### TC-UI-05: Global Search
1. Use top-bar global search
2. **Expected**: Results from all data sources, navigate to correct page

### TC-UI-06: Logo Branding
1. Check login screen — dark Roaring Brook logo
2. Check sidebar — light Roaring Brook logo
3. Check browser tab — favicon with logo
4. **Expected**: All logos display correctly

---

## Deploy Readiness Checklist

- [ ] Build completes without errors (`npm run build`)
- [ ] .env configured with correct Azure AD credentials
- [ ] Azure AD app registration has correct redirect URI for production
- [ ] SharePoint lists created and accessible
- [ ] Admin consent granted for all Graph API permissions
- [ ] Role assignments configured in src/lib/roles.js
- [ ] Production redirect URI added in Azure AD (e.g., https://compliancehub.roaringbrookrecovery.com)
- [ ] Static files served with proper MIME types
- [ ] SPA fallback configured (all routes -> index.html)
