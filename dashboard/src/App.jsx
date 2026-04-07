import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import PublicClientView from './components/clients/PublicClientView';

function App() {
  const { isAuthenticated } = useAuth();
  const [sharedClientId, setSharedClientId] = useState(null);

  useEffect(() => {
    function checkHash() {
      const hash = window.location.hash;
      const match = hash.match(/^#share\/(.+)$/);
      setSharedClientId(match ? match[1] : null);
    }
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (sharedClientId) {
    return <PublicClientView clientId={sharedClientId} />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
}

export default App;
