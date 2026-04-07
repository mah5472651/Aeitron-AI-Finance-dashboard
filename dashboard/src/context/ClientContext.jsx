import { createContext, useContext, useReducer, useEffect } from 'react';
import { STORAGE_KEY, ROADMAP_STAGES } from '../utils/constants';
import { migrateRoadmapStage } from '../utils/calculations';

const ClientContext = createContext(null);

function clientReducer(state, action) {
  switch (action.type) {
    case 'ADD_CLIENT':
      return { clients: [...state.clients, action.payload] };
    case 'UPDATE_CLIENT':
      return {
        clients: state.clients.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload, updatedAt: new Date().toISOString() } : c
        ),
      };
    case 'DELETE_CLIENT':
      return { clients: state.clients.filter((c) => c.id !== action.payload) };
    case 'COMPLETE_STAGE': {
      const { clientId, stage } = action.payload;
      return {
        clients: state.clients.map((c) => {
          if (c.id !== clientId) return c;
          const completedStages = [...new Set([...(c.completedStages || []), stage])];
          let newRoadmapStage = c.roadmapStage;
          const stageIdx = ROADMAP_STAGES.indexOf(stage);
          const currentIdx = ROADMAP_STAGES.indexOf(c.roadmapStage);
          if (stageIdx === currentIdx) {
            newRoadmapStage = ROADMAP_STAGES.find((s) => !completedStages.includes(s)) || ROADMAP_STAGES[ROADMAP_STAGES.length - 1];
          }
          return {
            ...c,
            completedStages,
            roadmapStage: newRoadmapStage,
            milestones: Math.round((completedStages.length / ROADMAP_STAGES.length) * 100),
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }
    case 'LOAD_CLIENTS':
      return { clients: action.payload };
    default:
      return state;
  }
}

function migrateClient(client) {
  const migrated = {
    deadline: null,
    roadmapStage: 'Discovery',
    completedStages: [],
    assignedAgentId: null,
    ...client,
  };
  migrated.roadmapStage = migrateRoadmapStage(migrated.roadmapStage);
  return migrated;
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).map(migrateClient) : [];
  } catch {
    return [];
  }
}

export function ClientProvider({ children }) {
  const [state, dispatch] = useReducer(clientReducer, { clients: loadFromStorage() });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.clients));
    } catch (e) {
      console.warn('Failed to persist clients:', e);
    }
  }, [state.clients]);

  return (
    <ClientContext.Provider value={{ clients: state.clients, dispatch }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (!context) throw new Error('useClients must be used within ClientProvider');
  return context;
}
