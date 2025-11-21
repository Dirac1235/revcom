import { useEffect, useState, useCallback } from 'react';
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

  const supabase = createClient();

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('requests').select('*');

      if (options.buyerId) {
        query = query.eq('buyer_id', options.buyerId);
      }

      if (options.status) {
        query = query.eq('status', options.status);
      } else {
        // Default to open requests only
        query = query.eq('status', 'open');
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      query = query.order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
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
  }, [options.buyerId, options.status, options.category, options.search, options.limit]);

  useEffect(() => {
    fetchRequests();
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

  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      setRequest(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchRequest = async () => {
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
