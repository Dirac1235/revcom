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
    console.log('[useRequests] fetchRequests called');
    
    try {
      setLoading(true);
      setError(null);

      let data: Request[];

      if (buyerId) {
        data = await getBuyerRequests(buyerId);
      } else {
        data = await getOpenRequests();
      }

      // Apply client-side filters
      if (status) {
        data = data.filter(r => r.status === status);
      }

      if (category) {
        data = data.filter(r => r.category === category);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        data = data.filter(r => 
          r.title?.toLowerCase().includes(searchLower) || 
          r.description?.toLowerCase().includes(searchLower)
        );
      }

      if (limit) {
        data = data.slice(0, limit);
      }

      console.log('[useRequests] fetchRequests succeeded with', data.length, 'requests');
      setRequests(data);
    } catch (err) {
      console.error('[useRequests] fetchRequests failed:', err);
      setError(err as Error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [buyerId, status, category, search, limit]);

  useEffect(() => {
    if (!isReady) {
      console.log('[useRequests] Waiting for auth to be ready...');
      return;
    }

    console.log('[useRequests] Auth is ready, fetching requests...');
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
    if (!isReady) {
      console.log('[useRequest] Waiting for auth to be ready...');
      return;
    }

    if (!id) {
      setRequest(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchRequest = async () => {
      console.log('[useRequest] Fetching request with id:', id);
      
      try {
        setLoading(true);
        setError(null);

        const data = await getRequestById(id);

        if (!cancelled) {
          console.log('[useRequest] Request fetch succeeded:', data ? 'found' : 'not found');
          setRequest(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useRequest] Request fetch failed:', err);
          setError(err as Error);
          setRequest(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRequest();

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
