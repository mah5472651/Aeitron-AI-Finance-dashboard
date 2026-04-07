import { createContext, useContext, useReducer, useEffect } from 'react';
import { CLIENT_NOTES_STORAGE_KEY } from '../utils/constants';

const ClientNotesContext = createContext(null);

function notesReducer(state, action) {
  switch (action.type) {
    case 'ADD_NOTE':
      return { notes: [...state.notes, action.payload] };
    case 'DELETE_NOTE':
      return { notes: state.notes.filter((n) => n.id !== action.payload) };
    default:
      return state;
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(CLIENT_NOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function ClientNotesProvider({ children }) {
  const [state, dispatch] = useReducer(notesReducer, {
    notes: loadFromStorage(),
  });

  useEffect(() => {
    try {
      localStorage.setItem(CLIENT_NOTES_STORAGE_KEY, JSON.stringify(state.notes));
    } catch (e) {
      console.warn('Failed to persist client notes:', e);
    }
  }, [state.notes]);

  return (
    <ClientNotesContext.Provider value={{ notes: state.notes, dispatch }}>
      {children}
    </ClientNotesContext.Provider>
  );
}

export function useClientNotes() {
  const context = useContext(ClientNotesContext);
  if (!context) throw new Error('useClientNotes must be used within ClientNotesProvider');
  return context;
}
