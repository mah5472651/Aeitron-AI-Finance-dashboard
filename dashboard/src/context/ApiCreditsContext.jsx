import { createContext, useContext, useReducer, useEffect } from 'react';
import { API_CREDITS_STORAGE_KEY, DEFAULT_API_SERVICES } from '../utils/constants';

const ApiCreditsContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_SERVICE':
      return {
        services: state.services.map((s) =>
          s.name === action.payload.name ? { ...s, ...action.payload } : s
        ),
      };
    case 'RESET_SERVICES':
      return { services: DEFAULT_API_SERVICES };
    default:
      return state;
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(API_CREDITS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_API_SERVICES;
  } catch {
    return DEFAULT_API_SERVICES;
  }
}

export function ApiCreditsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { services: loadFromStorage() });

  useEffect(() => {
    try {
      localStorage.setItem(API_CREDITS_STORAGE_KEY, JSON.stringify(state.services));
    } catch (e) {
      console.warn('Failed to persist API credits:', e);
    }
  }, [state.services]);

  return (
    <ApiCreditsContext.Provider value={{ services: state.services, dispatch }}>
      {children}
    </ApiCreditsContext.Provider>
  );
}

export function useApiCredits() {
  const context = useContext(ApiCreditsContext);
  if (!context) throw new Error('useApiCredits must be used within ApiCreditsProvider');
  return context;
}
