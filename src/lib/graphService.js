import { Client } from '@microsoft/microsoft-graph-client';
import { sharepointConfig } from './msalConfig';

let graphClient = null;
let siteId = null;

// Initialize the Graph client with an access token provider
export function initGraphClient(getAccessToken) {
  graphClient = Client.init({
    authProvider: async (done) => {
      try {
        const token = await getAccessToken();
        done(null, token);
      } catch (error) {
        done(error, null);
      }
    },
  });
}

// Get the SharePoint site ID (cached after first call)
async function getSiteId() {
  if (siteId) return siteId;
  const site = await graphClient
    .api(`/sites/${sharepointConfig.siteHostname}:${sharepointConfig.sitePath}`)
    .get();
  siteId = site.id;
  return siteId;
}

// ═══════════════════════════════════════════
// Generic SharePoint List CRUD Operations
// ═══════════════════════════════════════════

// Get all lists on the site
export async function getLists() {
  const id = await getSiteId();
  const result = await graphClient.api(`/sites/${id}/lists`).get();
  return result.value;
}

// Get list items with optional expand & filter
export async function getListItems(listName, options = {}) {
  const id = await getSiteId();
  const { select, expand, filter, top = 500 } = options;

  let request = graphClient.api(`/sites/${id}/lists/${listName}/items`);

  // Always expand fields
  request = request.expand('fields');

  if (select) request = request.select(select);
  if (filter) request = request.filter(filter);
  if (top) request = request.top(top);

  const result = await request.get();
  return result.value.map(item => ({
    id: item.id,
    ...item.fields,
  }));
}

// Create a new list item
export async function createListItem(listName, fields) {
  const id = await getSiteId();
  const result = await graphClient
    .api(`/sites/${id}/lists/${listName}/items`)
    .post({ fields });
  return { id: result.id, ...result.fields };
}

// Update a list item
export async function updateListItem(listName, itemId, fields) {
  const id = await getSiteId();
  await graphClient
    .api(`/sites/${id}/lists/${listName}/items/${itemId}/fields`)
    .patch(fields);
  return { id: itemId, ...fields };
}

// Delete a list item
export async function deleteListItem(listName, itemId) {
  const id = await getSiteId();
  await graphClient
    .api(`/sites/${id}/lists/${listName}/items/${itemId}`)
    .delete();
}

// ═══════════════════════════════════════════
// Domain-Specific Service Functions
// ═══════════════════════════════════════════

// List name mapping (SharePoint list display names)
const LISTS = {
  standards: 'Standards',
  policies: 'Policies',
  incidents: 'Incidents',
  training: 'Training',
  personnel: 'Personnel',
  credentials: 'Credentials',
  licenses: 'Licenses',
  eocInspections: 'EOCInspections',
  ligatureRisk: 'LigatureRisk',
  regulatoryChanges: 'RegulatoryChanges',
  auditLog: 'AuditLog',
  dailyStaffing: 'DailyStaffing',
  crosswalk: 'Crosswalk',
  programApplicability: 'ProgramApplicability',
  evidence: 'Evidence',
  complianceTasks: 'ComplianceTasks',
  trainingRecords: 'TrainingRecords',
  contracts: 'Contracts',
  facilities: 'Facilities',
};

// ── Standards ──
export async function getStandards() {
  return getListItems(LISTS.standards);
}
export async function createStandard(data) {
  return createListItem(LISTS.standards, data);
}
export async function updateStandard(id, data) {
  return updateListItem(LISTS.standards, id, data);
}
export async function deleteStandard(id) {
  return deleteListItem(LISTS.standards, id);
}

// ── Policies ──
export async function getPolicies() {
  return getListItems(LISTS.policies);
}
export async function createPolicy(data) {
  return createListItem(LISTS.policies, data);
}
export async function updatePolicy(id, data) {
  return updateListItem(LISTS.policies, id, data);
}
export async function deletePolicy(id) {
  return deleteListItem(LISTS.policies, id);
}

// ── Incidents ──
export async function getIncidents() {
  return getListItems(LISTS.incidents);
}
export async function createIncident(data) {
  return createListItem(LISTS.incidents, data);
}
export async function updateIncident(id, data) {
  return updateListItem(LISTS.incidents, id, data);
}

// ── Training ──
export async function getTraining() {
  return getListItems(LISTS.training);
}
export async function createTrainingRecord(data) {
  return createListItem(LISTS.training, data);
}
export async function updateTrainingRecord(id, data) {
  return updateListItem(LISTS.training, id, data);
}

// ── Personnel ──
export async function getPersonnel() {
  return getListItems(LISTS.personnel);
}
export async function createPersonnel(data) {
  return createListItem(LISTS.personnel, data);
}
export async function updatePersonnel(id, data) {
  return updateListItem(LISTS.personnel, id, data);
}

// ── Credentials ──
export async function getCredentials() {
  return getListItems(LISTS.credentials);
}
export async function createCredential(data) {
  return createListItem(LISTS.credentials, data);
}
export async function updateCredential(id, data) {
  return updateListItem(LISTS.credentials, id, data);
}

// ── Licenses ──
export async function getLicenses() {
  return getListItems(LISTS.licenses);
}
export async function createLicense(data) {
  return createListItem(LISTS.licenses, data);
}
export async function updateLicense(id, data) {
  return updateListItem(LISTS.licenses, id, data);
}

// ── EOC Inspections ──
export async function getEOCInspections() {
  return getListItems(LISTS.eocInspections);
}
export async function createEOCInspection(data) {
  return createListItem(LISTS.eocInspections, data);
}
export async function updateEOCInspection(id, data) {
  return updateListItem(LISTS.eocInspections, id, data);
}

// ── Ligature Risk ──
export async function getLigatureRisks() {
  return getListItems(LISTS.ligatureRisk);
}
export async function createLigatureRisk(data) {
  return createListItem(LISTS.ligatureRisk, data);
}
export async function updateLigatureRisk(id, data) {
  return updateListItem(LISTS.ligatureRisk, id, data);
}

// ── Crosswalk ──
export async function getCrosswalk() { return getListItems(LISTS.crosswalk); }
export async function createCrosswalkItem(data) { return createListItem(LISTS.crosswalk, data); }
export async function updateCrosswalkItem(id, data) { return updateListItem(LISTS.crosswalk, id, data); }
export async function deleteCrosswalkItem(id) { return deleteListItem(LISTS.crosswalk, id); }

// ── Program Applicability ──
export async function getProgramApplicability() { return getListItems(LISTS.programApplicability); }
export async function createProgramApplicability(data) { return createListItem(LISTS.programApplicability, data); }
export async function updateProgramApplicability(id, data) { return updateListItem(LISTS.programApplicability, id, data); }

// ── Evidence ──
export async function getEvidence() { return getListItems(LISTS.evidence); }
export async function createEvidence(data) { return createListItem(LISTS.evidence, data); }
export async function updateEvidence(id, data) { return updateListItem(LISTS.evidence, id, data); }
export async function deleteEvidence(id) { return deleteListItem(LISTS.evidence, id); }

// ── Compliance Tasks ──
export async function getComplianceTasks() { return getListItems(LISTS.complianceTasks); }
export async function createComplianceTask(data) { return createListItem(LISTS.complianceTasks, data); }
export async function updateComplianceTask(id, data) { return updateListItem(LISTS.complianceTasks, id, data); }
export async function deleteComplianceTask(id) { return deleteListItem(LISTS.complianceTasks, id); }

// ── Training Records ──
export async function getTrainingRecords() { return getListItems(LISTS.trainingRecords); }
export async function createTrainingRecordItem(data) { return createListItem(LISTS.trainingRecords, data); }
export async function updateTrainingRecordItem(id, data) { return updateListItem(LISTS.trainingRecords, id, data); }

// ── Contracts ──
export async function getContracts() { return getListItems(LISTS.contracts); }
export async function createContract(data) { return createListItem(LISTS.contracts, data); }
export async function updateContract(id, data) { return updateListItem(LISTS.contracts, id, data); }

// ── Facilities ──
export async function getFacilities() { return getListItems(LISTS.facilities); }
export async function createFacility(data) { return createListItem(LISTS.facilities, data); }
export async function updateFacility(id, data) { return updateListItem(LISTS.facilities, id, data); }

// ═══════════════════════════════════════════
// OneDrive / SharePoint Document Library
// ═══════════════════════════════════════════

// Get files from the ComplianceHub site's document library
export async function getSiteFiles(folderPath = '') {
  const id = await getSiteId();
  const path = folderPath ? `root:/${folderPath}:/children` : 'root/children';
  const result = await graphClient
    .api(`/sites/${id}/drive/${path}`)
    .select('id,name,size,lastModifiedDateTime,webUrl,file,folder,createdBy')
    .get();
  return result.value;
}

// Get files from a specific folder in the Policies document library
export async function getPolicyDocuments(folderPath = 'Policies') {
  return getSiteFiles(folderPath);
}

// Get current user's profile
export async function getCurrentUser() {
  const user = await graphClient.api('/me').select('displayName,mail,jobTitle,department').get();
  return user;
}
