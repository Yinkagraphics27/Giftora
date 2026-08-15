-- Add status column for vendor approval workflow
ALTER TABLE public.vendor_profiles 
ADD COLUMN status text NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add subscription_status column
ALTER TABLE public.vendor_profiles 
ADD COLUMN subscription_status text NOT NULL DEFAULT 'inactive'
CHECK (subscription_status IN ('active', 'inactive'));

-- Update the public_vendor_profiles view to only show approved vendors
DROP VIEW IF EXISTS public.public_vendor_profiles;
CREATE VIEW public.public_vendor_profiles WITH (security_invoker = true) AS
SELECT 
  id,
  business_name,
  country,
  city,
  description,
  logo_url,
  is_verified,
  is_launch_partner,
  created_at,
  vendor_type
FROM public.vendor_profiles
WHERE status = 'approved' AND is_verified = true;