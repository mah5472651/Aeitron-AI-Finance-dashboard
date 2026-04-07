import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { NOTIFICATIONS_STORAGE_KEY } from '../utils/constants';

const NotificationContext = createContext(null);

function notificationReducer(state, action) {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const exists = state.notifications.some((n) => n.dedupKey === action.payload.dedupKey);
      if (exists) return state;
      return { notifications: [action.payload, ...state.notifications] };
    }
    case 'MARK_READ':
      return {
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_READ':
      return {
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case 'DISMISS':
      return {
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    case 'CLEAR_ALL':
      return { notifications: [] };
    default:
      return state;
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: loadFromStorage(),
  });

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(state.notifications));
    } catch (e) {
      console.warn('Failed to persist notifications:', e);
    }
  }, [state.notifications]);

  const addNotification = useCallback((notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: crypto.randomUUID(),
        read: false,
        createdAt: new Date().toISOString(),
        ...notification,
      },
    });
  }, []);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        unreadCount,
        dispatch,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
