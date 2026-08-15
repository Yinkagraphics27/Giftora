-- Add explicit deny policies for anonymous users on sensitive tables
-- This ensures anonymous users cannot SELECT any data from these tables

-- 1. Deny anonymous access to vendor_profiles (protects contact info)
CREATE POLICY "Deny anonymous access to vendor_profiles"
ON public.vendor_profiles
FOR SELECT
TO anon
USING (false);

-- 2. Deny anonymous read access to buyer_inquiries (protects customer PII)
CREATE POLICY "Deny anonymous read access to buyer_inquiries"
ON public.buyer_inquiries
FOR SELECT
TO anon
USING (false);

-- 3. Deny anonymous read access to chat_messages (protects private messages)
CREATE POLICY "Deny anonymous read access to chat_messages"
ON public.chat_messages
FOR SELECT
TO anon
USING (false);

-- 4. Deny anonymous read access to chat_conversations (protects buyer contact info)
CREATE POLICY "Deny anonymous read access to chat_conversations"
ON public.chat_conversations
FOR SELECT
TO anon
USING (false);