-- Add new columns to orders table for enhanced checkout flow
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS delivery_phone TEXT,
ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
ADD COLUMN IF NOT EXISTS order_notes TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pay_on_delivery';

-- Also ensure listings table has inventory_quantity column
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS inventory_quantity INTEGER DEFAULT 10;

COMMENT ON COLUMN public.orders.listing_id IS 'Reference to the listing/product being ordered';
COMMENT ON COLUMN public.orders.delivery_phone IS 'Phone number for delivery contact';
COMMENT ON COLUMN public.orders.delivery_notes IS 'Special delivery instructions';
COMMENT ON COLUMN public.orders.order_notes IS 'Notes or questions for the seller';
COMMENT ON COLUMN public.orders.payment_method IS 'Selected payment method (pay_on_delivery, bank_transfer, mobile_money)';
