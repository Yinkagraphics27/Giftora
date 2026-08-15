-- Fix security definer view by using security_invoker = true
-- This ensures RLS policies of the querying user are enforced

DROP VIEW IF EXISTS public.public_products;

CREATE VIEW public.public_products 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.vendor_id,
  p.name,
  p.description,
  p.category,
  p.price_min,
  p.price_max,
  p.image_url,
  p.is_vendor_deal,
  p.status,
  p.is_active,
  p.created_at,
  p.updated_at
FROM public.products p
JOIN public.vendor_profiles vp ON p.vendor_id = vp.id
WHERE p.status = 'active'
  AND vp.status = 'approved'
  AND (
    vp.subscription_status = 'active' 
    OR (
      -- Allow first 10 products even without subscription
      (SELECT COUNT(*) FROM public.products WHERE vendor_id = p.vendor_id AND status = 'active') <= 10
    )
  );