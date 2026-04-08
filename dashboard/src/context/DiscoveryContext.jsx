import { createContext, useContext, useReducer, useEffect } from 'react';
import { DISCOVERY_STORAGE_KEY } from '../utils/constants';

const DiscoveryContext = createContext(null);

const initialState = {
  keywords: [],
  feedItems: [],
  isRunning: false,
  autoPilot: false,
  lastRun: null,
};

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(DISCOVERY_STORAGE_KEY);
    if (!stored) return initialState;
    const { keywords, autoPilot, lastRun } = JSON.parse(stored);
    return { ...initialState, keywords: keywords ?? [], autoPilot: autoPilot ?? false, lastRun: lastRun ?? null };
  } catch {
    return initialState;
  }
}

function discoveryReducer(state, action) {
  switch (action.type) {
    case 'ADD_KEYWORD': {
      const trimmed = action.payload.trim();
      if (!trimmed) return state;
      const already = state.keywords.some((k) => k.toLowerCase() === trimmed.toLowerCase());
      if (already) return state;
      return { ...state, keywords: [...state.keywords, trimmed] };
    }
    case 'REMOVE_KEYWORD':
      return { ...state, keywords: state.keywords.filter((k) => k !== action.payload) };
    case 'SET_RUNNING':
      return { ...state, isRunning: action.payload };
    case 'SET_LAST_RUN':
      return { ...state, lastRun: action.payload };
    case 'TOGGLE_AUTOPILOT':
      return { ...state, autoPilot: !state.autoPilot };
    case 'ADD_FEED_ITEMS':
      return { ...state, feedItems: [...action.payload, ...state.feedItems] };
    case 'IGNORE_ITEM':
      return { ...state, feedItems: state.feedItems.filter((item) => item.id !== action.payload) };
    default:
      return state;
  }
}

export function DiscoveryProvider({ children }) {
  const [state, dispatch] = useReducer(discoveryReducer, undefined, loadFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(
        DISCOVERY_STORAGE_KEY,
        JSON.stringify({ keywords: state.keywords, autoPilot: state.autoPilot, lastRun: state.lastRun })
      );
    } catch (e) {
      console.warn('Failed to persist discovery state:', e);
    }
  }, [state.keywords, state.autoPilot, state.lastRun]);

  return (
    <DiscoveryContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext);
  if (!ctx) throw new Error('useDiscovery must be used within DiscoveryProvider');
  return ctx;
}
