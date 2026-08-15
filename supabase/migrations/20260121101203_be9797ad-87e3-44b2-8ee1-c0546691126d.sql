-- =====================================================
-- GIFTORA SUBSCRIPTION SYSTEM - COMPLETE MIGRATION
-- =====================================================

-- 1. Add status column to products table (replacing is_active boolean)
ALTER TABLE public.products 
ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- Migrate existing data from is_active to status
UPDATE public.products 
SET status = CASE 
  WHEN is_active = true THEN 'active' 
  ELSE 'draft' 
END;

-- Add admin review tracking columns to products
ALTER TABLE public.products 
ADD COLUMN admin_review_notes TEXT,
ADD COLUMN reviewed_at TIMESTAMPTZ,
ADD COLUMN reviewed_by UUID;

-- 2. Add subscription-related fields to vendor_profiles
ALTER TABLE public.vendor_profiles 
ADD COLUMN subscription_expires_at TIMESTAMPTZ,
ADD COLUMN subscription_paused_at TIMESTAMPTZ,
ADD COLUMN subscription_pause_days_used INTEGER DEFAULT 0,
ADD COLUMN free_month_earned BOOLEAN DEFAULT false,
ADD COLUMN is_trusted_vendor BOOLEAN DEFAULT false,
ADD COLUMN products_reviewed_count INTEGER DEFAULT 0,
ADD COLUMN paystack_customer_code TEXT,
ADD COLUMN paystack_subscription_code TEXT,
ADD COLUMN paystack_authorization_code TEXT;

-- 3. Create vendor_payments table for tracking payment history
CREATE TABLE public.vendor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payment_type TEXT NOT NULL, -- 'subscription', 'renewal', 'free_reward'
  paystack_reference TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on vendor_payments
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;

-- Vendors can only view their own payments
CREATE POLICY "Vendors can view their own payments"
ON public.vendor_payments
FOR SELECT
USING (vendor_id IN (
  SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
));

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.vendor_payments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Update public_products view to filter by new status column
-- and only show products from vendors with valid subscriptions
DROP VIEW IF EXISTS public.public_products;

CREATE VIEW public.public_products AS
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

-- 5. Update RLS policy for products to include new status-based access
-- Vendors can view their own products regardless of status
-- This policy already exists and covers vendor access

-- Add policy for public to view active products (via the view)
-- The view already handles the filtering, so no additional policy needed