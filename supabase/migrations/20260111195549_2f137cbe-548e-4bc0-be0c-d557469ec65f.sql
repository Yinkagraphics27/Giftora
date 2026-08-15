-- Remove the policy that still exposes all columns to authenticated users
DROP POLICY IF EXISTS "Authenticated users can view approved vendor profiles via view" ON public.vendor_profiles;

-- Create a stricter policy: only owners and admins can see full vendor_profiles
-- Public and authenticated users should use public_vendor_profiles view instead
-- (The view is already safe - no email, phone, whatsapp columns)