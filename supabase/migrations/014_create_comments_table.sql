-- ============================================================
-- 1. Fix reviews RLS: restrict seller UPDATE to seller_response only via RPC
-- ============================================================

DROP POLICY IF EXISTS "Sellers can update reviews of their products" ON public.reviews;

CREATE OR REPLACE FUNCTION update_seller_response(p_review_id UUID, p_response TEXT)
RETURNS public.reviews AS $$
DECLARE
  v_review public.reviews;
BEGIN
  UPDATE public.reviews
  SET seller_response = p_response, updated_at = now()
  WHERE id = p_review_id
    AND EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = reviews.product_id AND l.seller_id = auth.uid()
    )
  RETURNING * INTO v_review;

  IF v_review IS NULL THEN
    RAISE EXCEPTION 'Review not found or you are not the product seller';
  END IF;

  RETURN v_review;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. Atomic increment for review helpful_count via RPC
-- ============================================================

CREATE OR REPLACE FUNCTION increment_helpful_count(p_review_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.reviews
  SET helpful_count = helpful_count + 1
  WHERE id = p_review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. Product Q&A table
-- ============================================================

CREATE TABLE public.product_qa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0),
  is_seller_answer BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.product_qa(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_product_qa_product_id ON public.product_qa(product_id);
CREATE INDEX idx_product_qa_parent_id ON public.product_qa(parent_id);
CREATE INDEX idx_product_qa_created_at ON public.product_qa(created_at DESC);

ALTER TABLE public.product_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Q&A entries are viewable by everyone"
  ON public.product_qa FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert Q&A entries"
  ON public.product_qa FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own Q&A entries"
  ON public.product_qa FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own Q&A entries"
  ON public.product_qa FOR DELETE USING (auth.uid() = author_id);
