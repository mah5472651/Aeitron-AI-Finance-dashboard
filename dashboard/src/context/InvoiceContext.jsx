import { createContext, useContext, useReducer, useEffect } from 'react';
import { INVOICES_STORAGE_KEY, BILL_FROM_DEFAULTS } from '../utils/constants';

const InvoiceContext = createContext(null);

function invoiceReducer(state, action) {
  switch (action.type) {
    case 'ADD_INVOICE':
      return { invoices: [...state.invoices, action.payload] };
    case 'UPDATE_INVOICE':
      return {
        invoices: state.invoices.map((inv) =>
          inv.id === action.payload.id
            ? { ...inv, ...action.payload, updatedAt: new Date().toISOString() }
            : inv
        ),
      };
    case 'DELETE_INVOICE':
      return { invoices: state.invoices.filter((inv) => inv.id !== action.payload) };
    default:
      return state;
  }
}

function migrateInvoice(inv) {
  return {
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    taxAmount: 0,
    subtotal: inv.subtotal ?? inv.total ?? 0,
    paymentInstructions: { bank: {}, paypal: {}, wise: {} },
    terms: '',
    signatureName: '',
    billFrom: { ...BILL_FROM_DEFAULTS },
    ...inv,
  };
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(INVOICES_STORAGE_KEY);
    const invoices = stored ? JSON.parse(stored) : [];
    return invoices.map(migrateInvoice);
  } catch {
    return [];
  }
}

export function InvoiceProvider({ children }) {
  const [state, dispatch] = useReducer(invoiceReducer, {
    invoices: loadFromStorage(),
  });

  useEffect(() => {
    try {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(state.invoices));
    } catch (e) {
      console.warn('Failed to persist invoices:', e);
    }
  }, [state.invoices]);

  return (
    <InvoiceContext.Provider value={{ invoices: state.invoices, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) throw new Error('useInvoices must be used within InvoiceProvider');
  return context;
}
