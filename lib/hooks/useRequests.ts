import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
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
  const mountedRef = useRef(false);

  const { buyerId, status, category, search, limit } = options;

  const fetchRequests = useCallback(async () => {
    const supabase = createClient();
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('requests').select('*');

      if (buyerId) {
        query = query.eq('buyer_id', buyerId);
      }

      if (status) {
        query = query.eq('status', status);
      } else {
        // Default to open requests only
        query = query.eq('status', 'open');
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      query = query.order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err) {
      setError(err as Error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [buyerId, status, category, search, limit]);

  useEffect(() => {
    // Always fetch on mount
    fetchRequests();
    mountedRef.current = true;
  }, [fetchRequests]);

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

  useEffect(() => {
    if (!id) {
      setRequest(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchRequest = async () => {
      const supabase = createClient();
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('requests')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!mounted) return;
        setRequest(data);
      } catch (err) {
        if (!mounted) return;
        setError(err as Error);
        setRequest(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRequest();

    return () => {
      mounted = false;
    };
  }, [id]);

  return {
    request,
    loading,
    error,
  };
}
