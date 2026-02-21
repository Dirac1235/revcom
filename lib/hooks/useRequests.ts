import { useEffect, useState, useCallback } from 'react';
import { getOpenRequests, getBuyerRequests, getRequestById } from '@/lib/data/requests-server';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Request } from '@/lib/types';

interface UseRequestsOptions {
  buyerId?: string;
  status?: 'open' | 'closed' | 'completed';
  category?: string;
  search?: string;
  limit?: number;
}

export function useRequests(options: UseRequestsOptions = {}) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isReady } = useAuth();

  const { buyerId, status, category, search, limit } = options;

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Request[] = buyerId
        ? await getBuyerRequests(buyerId)
        : await getOpenRequests();

      if (status) data = data.filter((r) => r.status === status);
      if (category) data = data.filter((r) => r.category === category);
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(
          (r) =>
            r.title?.toLowerCase().includes(q) ||
            r.description?.toLowerCase().includes(q)
        );
      }
      if (limit) data = data.slice(0, limit);

      setRequests(data);
    } catch (err) {
      setError(err as Error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [buyerId, status, category, search, limit]);

  useEffect(() => {
    if (!isReady) return;
    fetchRequests();
  }, [fetchRequests, isReady]);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
  };
}

export function useRequest(id: string | null) {
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!id) {
      setRequest(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRequestById(id);
        if (!cancelled) setRequest(data);
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setRequest(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isReady]);

  return {
    request,
    loading,
    error,
  };
}
