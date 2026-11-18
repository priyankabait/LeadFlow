
import { useState, useEffect, useCallback } from 'react';
import { opportunityService } from '../services/opportunityService';

export function useOpportunities(params = {}) {
  const [opportunities, setOpportunities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await opportunityService.getOpportunities(params);
      const payload = response.data?.data;

      const records = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

      setOpportunities(records);
      setTotal(payload?.totalSize ?? payload?.total ?? records.length);
    } catch (err) {
      setOpportunities([]);
      setTotal(0);
      setError(
        err.response?.data?.error || 'Failed to load opportunities'
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return {
    opportunities,
    total,
    loading,
    error,
    refetch: fetchOpportunities,
    fetchOpportunities
  };
}
