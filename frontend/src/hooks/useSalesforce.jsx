
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react';

import { authService } from '../services/authService';

const SalesforceContext = createContext(null);

export function SalesforceProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasChecked = useRef(false);

  const checkConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.getStatus();
      const data = response.data?.data;

      const isConnected = data?.connected === true;

      setConnected(isConnected);
      setUserInfo(isConnected ? data.userInfo ?? null : null);

      return isConnected;
    } catch (err) {
      setConnected(false);
      setUserInfo(null);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Unable to check Salesforce connection.'
      );

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasChecked.current) return;

    hasChecked.current = true;
    checkConnection();
  }, [checkConnection]);

  return (
    <SalesforceContext.Provider
      value={{
        connected,
        userInfo,
        loading,
        error,
        checkConnection
      }}
    >
      {children}
    </SalesforceContext.Provider>
  );
}

export function useSalesforce() {
  const context = useContext(SalesforceContext);

  if (context === null) {
    throw new Error(
      'useSalesforce must be used inside SalesforceProvider.'
    );
  }

  return context;
}
