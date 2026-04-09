import { createContext, useContext, useReducer, useEffect } from 'react';
import {
  PAYMENT_ACCOUNTS_STORAGE_KEY,
  TERMS_TEMPLATES_STORAGE_KEY,
  NOTES_PRESETS_STORAGE_KEY,
} from '../utils/constants';

const INITIAL_ACCOUNTS = [
  {
    id: 'dbbl-default',
    type: 'bank',
    label: 'DBBL – Mahmud Hasan',
    bankName: 'Dutch Bangla Bank',
    accountName: 'Mahmud Hasan',
    accountNumber: '1271070570700',
    swift: 'DBBLBDDH',
    iban: '',
    email: '',
    currency: 'USD',
  },
];

function loadAccounts() {
  try {
    const raw = localStorage.getItem(PAYMENT_ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_ACCOUNTS;
}

// Migrate old {id, text, label} shape → new {id, title, content} shape
function migratePreset(item) {
  if (item.content !== undefined) return item; // already new shape
  return {
    id: item.id,
    title: item.label || item.text?.slice(0, 60) || 'Untitled',
    content: item.text || '',
  };
}

function loadTermsPresets() {
  try {
    const raw = localStorage.getItem(TERMS_TEMPLATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(migratePreset);
    }
  } catch {}
  return [];
}

function loadNotesPresets() {
  try {
    const raw = localStorage.getItem(NOTES_PRESETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(migratePreset);
    }
  } catch {}
  return [];
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'DELETE_ACCOUNT':
      return { ...state, accounts: state.accounts.filter(a => a.id !== action.payload) };

    case 'ADD_TERMS_PRESET':
      return { ...state, termsPresets: [...state.termsPresets, action.payload] };
    case 'DELETE_TERMS_PRESET':
      return { ...state, termsPresets: state.termsPresets.filter(t => t.id !== action.payload) };

    case 'ADD_NOTES_PRESET':
      return { ...state, notesPresets: [...state.notesPresets, action.payload] };
    case 'DELETE_NOTES_PRESET':
      return { ...state, notesPresets: state.notesPresets.filter(t => t.id !== action.payload) };

    default:
      return state;
  }
}

const InvoicePresetsContext = createContext(null);

export function InvoicePresetsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    accounts: loadAccounts(),
    termsPresets: loadTermsPresets(),
    notesPresets: loadNotesPresets(),
  }));

  useEffect(() => {
    try { localStorage.setItem(PAYMENT_ACCOUNTS_STORAGE_KEY, JSON.stringify(state.accounts)); } catch {}
  }, [state.accounts]);

  useEffect(() => {
    try { localStorage.setItem(TERMS_TEMPLATES_STORAGE_KEY, JSON.stringify(state.termsPresets)); } catch {}
  }, [state.termsPresets]);

  useEffect(() => {
    try { localStorage.setItem(NOTES_PRESETS_STORAGE_KEY, JSON.stringify(state.notesPresets)); } catch {}
  }, [state.notesPresets]);

  function addTermsPreset(title, content) {
    dispatch({
      type: 'ADD_TERMS_PRESET',
      payload: { id: crypto.randomUUID(), title: title.trim(), content: content.trim() },
    });
  }

  function addNotesPreset(title, content) {
    dispatch({
      type: 'ADD_NOTES_PRESET',
      payload: { id: crypto.randomUUID(), title: title.trim(), content: content.trim() },
    });
  }

  return (
    <InvoicePresetsContext.Provider value={{ ...state, dispatch, addTermsPreset, addNotesPreset }}>
      {children}
    </InvoicePresetsContext.Provider>
  );
}

export function useInvoicePresets() {
  const ctx = useContext(InvoicePresetsContext);
  if (!ctx) throw new Error('useInvoicePresets must be used within InvoicePresetsProvider');
  return ctx;
}
