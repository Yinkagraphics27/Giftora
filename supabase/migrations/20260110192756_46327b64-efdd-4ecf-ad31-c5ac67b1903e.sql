-- Create storage bucket for vendor logos/profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-logos', 'vendor-logos', true);

-- Allow vendors to upload their own logo
CREATE POLICY "Vendors can upload their own logo"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow vendors to update their own logo
CREATE POLICY "Vendors can update their own logo"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vendor-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow vendors to delete their own logo
CREATE POLICY "Vendors can delete their own logo"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vendor-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public to view vendor logos (since bucket is public)
CREATE POLICY "Public can view vendor logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vendor-logos');

-- Also create bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Allow vendors to upload product images
CREATE POLICY "Vendors can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow vendors to update their product images
CREATE POLICY "Vendors can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow vendors to delete their product images
CREATE POLICY "Vendors can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public to view product images
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');