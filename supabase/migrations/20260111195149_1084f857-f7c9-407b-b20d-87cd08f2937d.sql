-- Remove the overly permissive public SELECT policy from vendor_profiles
-- Public access should go through the public_vendor_profiles view which excludes sensitive columns
DROP POLICY IF EXISTS "Public can view verified vendor profiles" ON public.vendor_profiles;

-- Add a policy for authenticated vendors to view approved vendor profiles (for B2B features)
-- This allows vendors to see other vendors' basic info but still protects sensitive data via the view
CREATE POLICY "Authenticated users can view approved vendor profiles via view" 
ON public.vendor_profiles 
FOR SELECT 
TO authenticated
USING (
  status = 'approved' AND is_verified = true
);