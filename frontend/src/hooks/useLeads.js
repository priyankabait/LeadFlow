
import { useState, useEffect, useCallback } from 'react';
import { leadService } from '../services/leadService';

export function useLeads(params = {}) {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await leadService.getLeads(params);
      const payload = response.data?.data;

      const records = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

      setLeads(records);
      setTotal(payload?.totalSize ?? payload?.total ?? records.length);
    } catch (err) {
      setLeads([]);
      setTotal(0);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to load leads'
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    total,
    loading,
    error,
    refetch: fetchLeads,
    fetchLeads
  };
}
