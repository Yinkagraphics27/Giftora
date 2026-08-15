-- Create vendor profiles table
CREATE TABLE public.vendor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  whatsapp TEXT,
  logo_url TEXT,
  description TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_launch_partner BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'growth', 'power')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vendor_profiles
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Vendor profiles policies
CREATE POLICY "Vendors can view their own profile"
ON public.vendor_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own profile"
ON public.vendor_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert their own profile"
ON public.vendor_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view verified vendor profiles"
ON public.vendor_profiles FOR SELECT
USING (is_verified = true);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('gift-boxes', 'hampers', 'baskets', 'trunks', 'souvenirs', 'accessories')),
  price_min NUMERIC(10,2) NOT NULL,
  price_max NUMERIC(10,2),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- B2B fields
  is_vendor_deal BOOLEAN NOT NULL DEFAULT false,
  minimum_order_quantity INTEGER,
  trade_price NUMERIC(10,2),
  vendor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Vendors can manage their own products"
ON public.products FOR ALL
USING (
  vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Public can view active products (excluding trade pricing)"
ON public.products FOR SELECT
USING (is_active = true);

-- Create vendor deal inquiries table
CREATE TABLE public.vendor_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  requester_vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  seller_vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vendor_inquiries
ALTER TABLE public.vendor_inquiries ENABLE ROW LEVEL SECURITY;

-- Inquiries policies - only vendors can see their own inquiries
CREATE POLICY "Vendors can view their sent inquiries"
ON public.vendor_inquiries FOR SELECT
USING (
  requester_vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Vendors can view received inquiries"
ON public.vendor_inquiries FOR SELECT
USING (
  seller_vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Vendors can create inquiries"
ON public.vendor_inquiries FOR INSERT
WITH CHECK (
  requester_vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Sellers can update inquiry status"
ON public.vendor_inquiries FOR UPDATE
USING (
  seller_vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_vendor_profiles_updated_at
BEFORE UPDATE ON public.vendor_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_inquiries_updated_at
BEFORE UPDATE ON public.vendor_inquiries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();