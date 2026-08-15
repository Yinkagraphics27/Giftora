-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;

-- Create a more secure INSERT policy that validates the vendor exists and is approved
-- This prevents fake conversations targeting non-existent or suspended vendors
CREATE POLICY "Anyone can create conversations with approved vendors" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vendor_profiles 
    WHERE id = vendor_id 
    AND status = 'approved' 
    AND is_verified = true
  )
);

-- Also fix chat_messages INSERT to validate conversation access
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;

-- Messages can only be inserted into conversations that exist
CREATE POLICY "Anyone can insert messages to valid conversations" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = conversation_id
  )
);

-- Fix buyer_inquiries INSERT to validate vendor exists
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.buyer_inquiries;

CREATE POLICY "Anyone can submit inquiries to approved vendors" 
ON public.buyer_inquiries 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vendor_profiles 
    WHERE id = vendor_id 
    AND status = 'approved' 
    AND is_verified = true
  )
);