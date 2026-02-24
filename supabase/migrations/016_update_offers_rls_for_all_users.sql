-- Allow all authenticated users to see offers
DROP POLICY IF EXISTS "offers_select_own" ON public.offers;

CREATE POLICY "offers_select_all" ON public.offers FOR SELECT
  USING (auth.uid() IS NOT NULL);
