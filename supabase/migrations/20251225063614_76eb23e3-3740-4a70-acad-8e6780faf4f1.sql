-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('buyer', 'vendor')),
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'whatsapp_share')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_conversations
-- Anyone can create a conversation (buyers initiating chat)
CREATE POLICY "Anyone can create conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (true);

-- Vendors can view their conversations
CREATE POLICY "Vendors can view their conversations"
ON public.chat_conversations
FOR SELECT
USING (vendor_id IN (
  SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
));

-- Vendors can update their conversations
CREATE POLICY "Vendors can update their conversations"
ON public.chat_conversations
FOR UPDATE
USING (vendor_id IN (
  SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
));

-- RLS policies for chat_messages
-- Anyone can insert messages (for buyer messages)
CREATE POLICY "Anyone can insert messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (true);

-- Vendors can view messages in their conversations
CREATE POLICY "Vendors can view messages in their conversations"
ON public.chat_messages
FOR SELECT
USING (conversation_id IN (
  SELECT cc.id FROM public.chat_conversations cc
  JOIN public.vendor_profiles vp ON cc.vendor_id = vp.id
  WHERE vp.user_id = auth.uid()
));

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Create indexes for performance
CREATE INDEX idx_chat_conversations_vendor_id ON public.chat_conversations(vendor_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Add trigger for updated_at on chat_conversations
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();