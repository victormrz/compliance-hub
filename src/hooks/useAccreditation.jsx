import { createContext, useContext, useState } from 'react';

const AccreditationContext = createContext();

export function AccreditationProvider({ children }) {
  const [body, setBody] = useState('all'); // 'all', 'tjc', 'carf', 'state', 'hipaa'

  const bodyFilters = {
    all: () => true,
    tjc: (item) => {
      const bodyField = item.body || item.accreditationBody || '';
      const refs = item.standardRefs || item.standardRef || '';
      return bodyField.toLowerCase().includes('joint commission') ||
             bodyField.toLowerCase().includes('tjc') ||
             (typeof refs === 'string' && (refs.startsWith('HR.') || refs.startsWith('EC.') || refs.startsWith('PC.') || refs.startsWith('RI.'))) ||
             (Array.isArray(refs) && refs.some(r => r.startsWith('HR.') || r.startsWith('EC.') || r.startsWith('PC.') || r.startsWith('RI.')));
    },
    carf: (item) => {
      const bodyField = item.body || item.accreditationBody || '';
      const refs = item.standardRefs || item.standardRef || '';
      return bodyField.toLowerCase().includes('carf') ||
             (typeof refs === 'string' && (refs.startsWith('1.') || refs.startsWith('2.'))) ||
             (Array.isArray(refs) && refs.some(r => r.startsWith('1.') || r.startsWith('2.')));
    },
    state: (item) => {
      const bodyField = item.body || item.accreditationBody || '';
      const refs = item.standardRefs || item.standardRef || '';
      return bodyField.toLowerCase().includes('state') ||
             (typeof refs === 'string' && (refs.includes('KAR') || refs.includes('CFR 2'))) ||
             (Array.isArray(refs) && refs.some(r => r.includes('KAR') || r.includes('CFR 2')));
    },
    hipaa: (item) => {
      const bodyField = item.body || item.accreditationBody || '';
      const refs = item.standardRefs || item.standardRef || '';
      return bodyField.toLowerCase().includes('hipaa') || bodyField.toLowerCase().includes('federal') ||
             (typeof refs === 'string' && refs.includes('45 CFR')) ||
             (Array.isArray(refs) && refs.some(r => r.includes('45 CFR')));
    },
  };

  const filterByBody = (items) => items.filter(bodyFilters[body]);

  const bodyLabels = {
    all: 'All Accreditation Bodies',
    tjc: 'Joint Commission (TJC)',
    carf: 'CARF International',
    state: 'State Regulations',
    hipaa: 'Federal (HIPAA)',
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
