import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ClientProvider } from './context/ClientContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { LeadProvider } from './context/LeadsContext';
import { NotificationProvider } from './context/NotificationContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { ClientNotesProvider } from './context/ClientNotesContext';
import { SystemHealthProvider } from './context/SystemHealthContext';
import { ApiCreditsProvider } from './context/ApiCreditsContext';
import { TeamProvider } from './context/TeamContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
    <AuthProvider>
      <ClientProvider>
        <ExpenseProvider>
          <LeadProvider>
            <NotificationProvider>
              <InvoiceProvider>
                <ClientNotesProvider>
                <SystemHealthProvider>
                  <ApiCreditsProvider>
                    <TeamProvider>
                      <ErrorBoundary>
                        <App />
                      </ErrorBoundary>
                    </TeamProvider>
                  </ApiCreditsProvider>
                </SystemHealthProvider>
              </ClientNotesProvider>
              </InvoiceProvider>
            </NotificationProvider>
          </LeadProvider>
        </ExpenseProvider>
      </ClientProvider>
    </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
