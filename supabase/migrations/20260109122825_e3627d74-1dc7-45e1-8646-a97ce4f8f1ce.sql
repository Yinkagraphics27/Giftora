-- Add vendor_type column to vendor_profiles
ALTER TABLE public.vendor_profiles 
ADD COLUMN vendor_type text NOT NULL DEFAULT 'curator' 
CHECK (vendor_type IN ('curator', 'wholesaler'));