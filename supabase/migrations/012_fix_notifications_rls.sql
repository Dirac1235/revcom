-- Fix notifications RLS to allow cross-user notifications (e.g., when buyer accepts/rejects offer,
-- a notification is inserted for the seller, and vice versa)
-- The original INSERT policy was too restrictive (only allowed inserting for own user_id).

DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;

-- Allow authenticated users to insert notifications for ANY user
-- This is needed because:
--   - When a buyer accepts an offer, they create a notification for the seller
--   - When a buyer rejects an offer, they create a notification for the seller
--   - When a seller submits an offer, they create a notification for the buyer
--   - When a seller updates order status, they create a notification for the buyer
CREATE POLICY "notifications_insert_authenticated" ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
