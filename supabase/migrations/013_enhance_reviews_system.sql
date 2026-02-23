-- Drop existing reviews table
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Create enhanced reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT true,
  seller_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(buyer_id, order_id)
);

CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON public.reviews(buyer_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can insert their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can update reviews of their products" ON public.reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.listings l 
    WHERE l.id = reviews.product_id AND l.seller_id = auth.uid()
  )
);

-- Add computed fields to listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Trigger to update listings rating
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    WITH stats AS (
      SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as avg_rating
      FROM public.reviews
      WHERE product_id = NEW.product_id
    )
    UPDATE public.listings
    SET average_rating = stats.avg_rating, review_count = stats.count
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    WITH stats AS (
      SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as avg_rating
      FROM public.reviews
      WHERE product_id = OLD.product_id
    )
    UPDATE public.listings
    SET average_rating = stats.avg_rating, review_count = stats.count
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_listing_rating_trigger
AFTER INSERT OR UPDATE OF rating OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_listing_rating();

-- Trigger to update seller (profile) rating
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT seller_id INTO v_seller_id FROM public.listings WHERE id = NEW.product_id;
  ELSE
    SELECT seller_id INTO v_seller_id FROM public.listings WHERE id = OLD.product_id;
  END IF;

  WITH stats AS (
    SELECT COUNT(r.*) as count, COALESCE(AVG(r.rating), 0) as avg_rating
    FROM public.reviews r
    JOIN public.listings l ON r.product_id = l.id
    WHERE l.seller_id = v_seller_id
  )
  UPDATE public.profiles
  SET rating = stats.avg_rating, total_reviews = stats.count
  WHERE id = v_seller_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_seller_rating_trigger
AFTER INSERT OR UPDATE OF rating OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_seller_rating();
