
import { useState, useEffect, useCallback } from 'react';
import { contactService } from '../services/contactService';

export function useContacts(params = {}) {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await contactService.getContacts(params);
      const payload = response.data?.data;

      const records = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

      setContacts(records);
      setTotal(payload?.totalSize ?? payload?.total ?? records.length);
    } catch (err) {
      setContacts([]);
      setTotal(0);
      setError(
        err.response?.data?.error || 'Failed to load contacts'
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    total,
    loading,
    error,
    refetch: fetchContacts,
    fetchContacts
  };
}
