-- Migration: Add inventory and product management columns to listings table
-- This migration adds columns needed for the seller product listing system

-- Add inventory_quantity column
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS inventory_quantity INTEGER DEFAULT 0;

-- Add images array column (for multiple product images)
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add specifications JSONB column (for custom product specs)
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';

-- Add views counter
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN public.listings.inventory_quantity IS 'Number of items in stock';
COMMENT ON COLUMN public.listings.images IS 'Array of image URLs for the product';
COMMENT ON COLUMN public.listings.specifications IS 'Custom product specifications as JSON';
COMMENT ON COLUMN public.listings.views IS 'Number of times product has been viewed';
