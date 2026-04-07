import { createContext, useContext, useReducer, useEffect } from 'react';
import { SYSTEM_HEALTH_STORAGE_KEY } from '../utils/constants';

const SystemHealthContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_AUTOMATION':
      return { automations: [...state.automations, action.payload] };
    case 'UPDATE_AUTOMATION':
      return {
        automations: state.automations.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        ),
      };
    case 'DELETE_AUTOMATION':
      return { automations: state.automations.filter((a) => a.id !== action.payload) };
    default:
      return state;
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(SYSTEM_HEALTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function SystemHealthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { automations: loadFromStorage() });

  useEffect(() => {
    try {
      localStorage.setItem(SYSTEM_HEALTH_STORAGE_KEY, JSON.stringify(state.automations));
    } catch (e) {
      console.warn('Failed to persist system health:', e);
    }
  }, [state.automations]);

  return (
    <SystemHealthContext.Provider value={{ automations: state.automations, dispatch }}>
      {children}
    </SystemHealthContext.Provider>
  );
}

export function useSystemHealth() {
  const context = useContext(SystemHealthContext);
  if (!context) throw new Error('useSystemHealth must be used within SystemHealthProvider');
  return context;
}
