import { createContext, useContext, useState } from 'react';

const AccreditationContext = createContext();

export function AccreditationProvider({ children }) {
  const [body, setBody] = useState('all'); // 'all', 'tjc', 'carf', 'state', 'federal'

  const bodyFilters = {
    all: () => true,
    tjc: (item) => {
      const bodyField = item.body || item.accreditationBody || '';
      const refs = item.standardRefs || item.standardRef || '';
      return bodyField.toLowerCase().includes('joint commission') ||
             bodyField.toLowerCase().includes('tjc') ||
             bodyField === 'TJC' ||
             (typeof refs === 'string' && (refs.startsWith('HR.') || refs.startsWith('EC.') || refs.startsWith('PC.') || refs.startsWith('RI.'))) ||
             (Array.isArray(refs) && refs.some(r => r.startsWith('HR.') || r.startsWith('EC.') || r.startsWith('PC.') || r.startsWith('RI.')));
    },
    carf: (item) => {
      const bodyField = item.body || item.accreditationBody || '';
      const refs = item.standardRefs || item.standardRef || '';
      return bodyField.toLowerCase().includes('carf') ||
             bodyField === 'CARF' ||
             (typeof refs === 'string' && (refs.startsWith('1.') || refs.startsWith('2.') || refs.startsWith('3.'))) ||
             (Array.isArray(refs) && refs.some(r => r.startsWith('1.') || r.startsWith('2.') || r.startsWith('3.')));
    },
    state: (item) => {
      const bodyField = item.body || item.accreditationBody || '';
      const refs = item.standardRefs || item.standardRef || '';
      return bodyField.toLowerCase().includes('state') ||
             bodyField.toLowerCase().includes('ky-dbhdid') ||
             bodyField === 'KY-DBHDID' ||
             (typeof refs === 'string' && refs.includes('KAR')) ||
             (Array.isArray(refs) && refs.some(r => r.includes('KAR')));
    },
    federal: (item) => {
      const bodyField = item.body || item.accreditationBody || '';
      const refs = item.standardRefs || item.standardRef || '';
      return bodyField.toLowerCase().includes('hipaa') ||
             bodyField.toLowerCase().includes('federal') ||
             bodyField === 'Federal' ||
             (typeof refs === 'string' && (refs.includes('45 CFR') || refs.includes('42 CFR'))) ||
             (Array.isArray(refs) && refs.some(r => r.includes('45 CFR') || r.includes('42 CFR')));
    },
  };

  const filterByBody = (items) => items.filter(bodyFilters[body]);

  const bodyLabels = {
    all: 'All Accreditation Bodies',
    tjc: 'Joint Commission (TJC)',
    carf: 'CARF International',
    state: 'KY-DBHDID (State)',
    federal: 'Federal (HIPAA / 42 CFR Part 2)',
  };

  return (
    <AccreditationContext.Provider value={{ body, setBody, filterByBody, bodyLabels }}>
      {children}
    </AccreditationContext.Provider>
  );
}

export function useAccreditation() {
  return useContext(AccreditationContext);
}
