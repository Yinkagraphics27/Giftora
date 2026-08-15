-- Remove the redundant/old INSERT policy
DROP POLICY IF EXISTS "Anyone can create buyer inquiries" ON public.buyer_inquiries;