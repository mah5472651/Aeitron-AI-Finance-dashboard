import { createContext, useContext, useReducer, useEffect } from 'react';
import { TEAM_STORAGE_KEY } from '../utils/constants';

const TeamContext = createContext(null);

function teamReducer(state, action) {
  switch (action.type) {
    case 'ADD_MEMBER':
      return { members: [...state.members, action.payload] };
    case 'UPDATE_MEMBER':
      return {
        members: state.members.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload, updatedAt: new Date().toISOString() } : m
        ),
      };
    case 'DELETE_MEMBER':
      return { members: state.members.filter((m) => m.id !== action.payload) };
    case 'LOAD_TEAM':
      return { members: action.payload };
    default:
      return state;
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(TEAM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function TeamProvider({ children }) {
  const [state, dispatch] = useReducer(teamReducer, { members: loadFromStorage() });

  useEffect(() => {
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(state.members));
    } catch (e) {
      console.warn('Failed to persist team:', e);
    }
  }, [state.members]);

  return (
    <TeamContext.Provider value={{ members: state.members, dispatch }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
}
