-- Create offers table for seller responses to buyer requests
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  delivery_timeline TEXT,
  delivery_cost DECIMAL(10,2) DEFAULT 0,
  payment_terms TEXT,
  attachments JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add additional fields to requests table
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS delivery_location TEXT;

-- Enable Row Level Security on offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Offers RLS policies
DROP POLICY IF EXISTS "offers_select_own" ON public.offers;
CREATE POLICY "offers_select_own" ON public.offers FOR SELECT
  USING (auth.uid() = seller_id OR EXISTS (
    SELECT 1 FROM public.requests r WHERE r.id = offers.request_id AND r.buyer_id = auth.uid()
  ));

DROP POLICY IF EXISTS "offers_insert_seller" ON public.offers;
CREATE POLICY "offers_insert_seller" ON public.offers FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "offers_update_own" ON public.offers;
CREATE POLICY "offers_update_own" ON public.offers FOR UPDATE
  USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "offers_delete_own" ON public.offers;
CREATE POLICY "offers_delete_own" ON public.offers FOR DELETE
  USING (auth.uid() = seller_id);

-- Create indexes for offers
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_request_id ON offers(request_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

COMMENT ON TABLE public.offers IS 'Seller offers submitted in response to buyer requests';
COMMENT ON COLUMN public.offers.delivery_timeline IS 'Expected delivery timeline (e.g., 1-2 weeks)';
COMMENT ON COLUMN public.offers.delivery_cost IS 'Delivery cost in ETB';
COMMENT ON COLUMN public.offers.payment_terms IS 'Proposed payment terms (e.g., 50% upfront)';
COMMENT ON COLUMN public.offers.attachments IS 'Array of attachment URLs';
