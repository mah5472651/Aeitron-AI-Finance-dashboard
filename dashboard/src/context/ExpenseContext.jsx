import { createContext, useContext, useReducer, useEffect } from 'react';
import { EXPENSE_STORAGE_KEY } from '../utils/constants';

const ExpenseContext = createContext(null);

function expenseReducer(state, action) {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return { expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload, updatedAt: new Date().toISOString() } : e
        ),
      };
    case 'DELETE_EXPENSE':
      return { expenses: state.expenses.filter((e) => e.id !== action.payload) };
    case 'LOAD_EXPENSES':
      return { expenses: action.payload };
    default:
      return state;
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(EXPENSE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, { expenses: loadFromStorage() });

  useEffect(() => {
    try {
      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(state.expenses));
    } catch (e) {
      console.warn('Failed to persist expenses:', e);
    }
  }, [state.expenses]);

  return (
    <ExpenseContext.Provider value={{ expenses: state.expenses, dispatch }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within ExpenseProvider');
  return context;
}
