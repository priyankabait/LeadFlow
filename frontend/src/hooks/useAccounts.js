
import { useState, useEffect, useCallback } from 'react';
import { accountService } from '../services/accountService';

export function useAccounts(params = {}) {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await accountService.getAccounts(params);
      const payload = response.data?.data;

      const records = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

      setAccounts(records);
      setTotal(payload?.totalSize ?? payload?.total ?? records.length);
    } catch (err) {
      setAccounts([]);
      setTotal(0);
      setError(
        err.response?.data?.error || 'Failed to load accounts'
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    total,
    loading,
    error,
    refetch: fetchAccounts,
    fetchAccounts
  };
}
