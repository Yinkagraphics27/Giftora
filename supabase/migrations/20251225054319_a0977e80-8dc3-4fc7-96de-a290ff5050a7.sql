-- Drop the existing public SELECT policy that exposes all columns
DROP POLICY IF EXISTS "Public can view active products (excluding trade pricing)" ON public.products;

-- Create a view that excludes sensitive columns for public access
CREATE VIEW public.public_products AS
SELECT 
  id, 
  vendor_id, 
  name, 
  description, 
  category, 
  price_min, 
  price_max, 
  image_url, 
  is_active, 
  is_vendor_deal,
  created_at, 
  updated_at
FROM public.products
WHERE is_active = true;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_products TO anon;
GRANT SELECT ON public.public_products TO authenticated;

-- Add policy for authenticated vendors to view vendor deals with trade pricing (on original table)
CREATE POLICY "Authenticated vendors can view vendor deals"
ON public.products FOR SELECT
TO authenticated
USING (
  is_vendor_deal = true 
  AND is_active = true
  AND EXISTS (
    SELECT 1 FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);