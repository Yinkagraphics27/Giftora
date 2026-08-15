import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  sender_type: "buyer" | "vendor";
  message: string;
  message_type: "text" | "whatsapp_share";
  created_at: string;
}

interface ChatWindowProps {
  vendorId: string;
  vendorName: string;
  productId?: string;
  onClose: () => void;
}

const buyerInfoSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email is required").max(255),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

type BuyerInfoData = z.infer<typeof buyerInfoSchema>;

export default function ChatWindow({ vendorId, vendorName, productId, onClose }: ChatWindowProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<BuyerInfoData>({
    resolver: zodResolver(buyerInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  // Check for existing conversation in localStorage
  useEffect(() => {
    const storedConversationId = localStorage.getItem(`chat_${vendorId}`);
    if (storedConversationId) {
      setConversationId(storedConversationId);
      fetchMessages(storedConversationId);
    }
  }, [vendorId]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (convId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, sender_type, message, message_type, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data as ChatMessage[]) || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async (data: BuyerInfoData) => {
    setIsLoading(true);
    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from("chat_conversations")
        .insert({
          vendor_id: vendorId,
          buyer_name: data.name,
          buyer_email: data.email,
          buyer_phone: data.phone || null,
          product_id: productId || null,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Send initial message
      const { error: msgError } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversation.id,
          sender_type: "buyer",
          message: data.message,
          message_type: "text",
        });

      if (msgError) throw msgError;

      // Store conversation ID
      localStorage.setItem(`chat_${vendorId}`, conversation.id);
      setConversationId(conversation.id);
      await fetchMessages(conversation.id);

      toast({
        title: "Chat Started",
        description: "Your message has been sent to the vendor.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start chat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          sender_type: "buyer",
          message: newMessage.trim(),
          message_type: "text",
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Show initial form if no conversation
  if (!conversationId) {
    return (
      <div className="p-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Start a conversation with {vendorName}. They'll respond via this chat.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(startConversation)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="John Doe" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="john@example.com" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="+234 800 000 0000" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hi, I'm interested in your products..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Start Chat
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="flex h-[400px] flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === "buyer" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.sender_type === "buyer"
                    ? "bg-primary text-primary-foreground"
                    : msg.message_type === "whatsapp_share"
                    ? "bg-green-500/10 border border-green-500/30 text-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.message_type === "whatsapp_share" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📱 WhatsApp: {msg.message}</span>
                  </div>
                ) : (
                  <p className="text-sm">{msg.message}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
