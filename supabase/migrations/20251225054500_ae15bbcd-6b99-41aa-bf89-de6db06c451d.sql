-- Drop and recreate the view with explicit SECURITY INVOKER to address the linter warning
DROP VIEW IF EXISTS public.public_products;

CREATE VIEW public.public_products 
WITH (security_invoker = true)
AS
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

-- Re-grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_products TO anon;
GRANT SELECT ON public.public_products TO authenticated;