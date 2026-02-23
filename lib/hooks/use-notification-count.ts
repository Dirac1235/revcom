"use client";

import { useState, useEffect, useCallback } from "react";
import { getUnreadNotificationCount } from "@/lib/data/notifications-server";

export function useNotificationCount(userId: string | undefined) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const unreadCount = await getUnreadNotificationCount(userId);
      setCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCount();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchCount]);

  const refresh = useCallback(() => {
    fetchCount();
  }, [fetchCount]);

  return { count, loading, refresh };
}
