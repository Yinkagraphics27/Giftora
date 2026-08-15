-- Create a public view for vendor profiles that EXCLUDES contact information
-- This view is for public/unauthenticated access
CREATE VIEW public.public_vendor_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  business_name,
  description,
  country,
  city,
  logo_url,
  is_verified,
  is_launch_partner,
  created_at
FROM public.vendor_profiles
WHERE is_verified = true;

-- Grant SELECT on the public view to anon and authenticated roles
GRANT SELECT ON public.public_vendor_profiles TO anon;
GRANT SELECT ON public.public_vendor_profiles TO authenticated;

-- Create a table for buyer inquiries to vendors (platform messaging)
CREATE TABLE public.buyer_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on buyer_inquiries
ALTER TABLE public.buyer_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can create an inquiry (buyers don't need to be authenticated)
CREATE POLICY "Anyone can create buyer inquiries"
ON public.buyer_inquiries
FOR INSERT
WITH CHECK (true);

-- Vendors can view inquiries sent to them
CREATE POLICY "Vendors can view their received inquiries"
ON public.buyer_inquiries
FOR SELECT
USING (
  vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

-- Vendors can update their received inquiries (e.g., mark as responded)
CREATE POLICY "Vendors can update their received inquiries"
ON public.buyer_inquiries
FOR UPDATE
USING (
  vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_buyer_inquiries_updated_at
BEFORE UPDATE ON public.buyer_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();