import { createContext, useContext, useReducer, useEffect } from 'react';
import { LEADS_STORAGE_KEY } from '../utils/constants';
import { migrateLeadStages } from '../utils/calculations';

const LeadsContext = createContext(null);

function leadsReducer(state, action) {
  switch (action.type) {
    case 'ADD_LEAD':
      return { leads: [...state.leads, action.payload] };
    case 'UPDATE_LEAD':
      return {
        leads: state.leads.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload, updatedAt: new Date().toISOString() } : l
        ),
      };
    case 'DELETE_LEAD':
      return { leads: state.leads.filter((l) => l.id !== action.payload) };
    case 'LOAD_LEADS':
      return { leads: action.payload };
    default:
      return state;
  }
}

function migrateLead(lead) {
  return {
    lastContacted: null,
    ...lead,
  };
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!stored) return [];
    const leads = JSON.parse(stored);
    return migrateLeadStages(leads).map(migrateLead);
  } catch {
    return [];
  }
}

export function LeadProvider({ children }) {
  const [state, dispatch] = useReducer(leadsReducer, { leads: loadFromStorage() });

  useEffect(() => {
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(state.leads));
    } catch (e) {
      console.warn('Failed to persist leads:', e);
    }
  }, [state.leads]);

  return (
    <LeadsContext.Provider value={{ leads: state.leads, dispatch }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) throw new Error('useLeads must be used within LeadProvider');
  return context;
}
