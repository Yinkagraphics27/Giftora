import { useState, useEffect } from "react";
import { MessageCircle, Send, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Conversation {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  product_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
  } | null;
  last_message?: string;
  unread_count?: number;
}

interface ChatMessage {
  id: string;
  sender_type: "buyer" | "vendor";
  message: string;
  message_type: "text" | "whatsapp_share";
  created_at: string;
}

export default function VendorChatDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { vendorProfile } = useAuth();
  const { toast } = useToast();

  // Check if vendor can share WhatsApp (paid subscription)
  const canShareWhatsApp = vendorProfile?.subscription_tier !== "starter" && vendorProfile?.whatsapp;

  useEffect(() => {
    if (vendorProfile) {
      fetchConversations();
    }
  }, [vendorProfile]);

  // Subscribe to new messages
  useEffect(() => {
    if (!vendorProfile) return;

    const channel = supabase
      .channel("vendor_chat_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage & { conversation_id: string };
          
          // Update messages if viewing that conversation
          if (selectedConversation?.id === newMsg.conversation_id) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
          
          // Refresh conversations to update last message
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorProfile, selectedConversation]);

  const fetchConversations = async () => {
    if (!vendorProfile) return;
    
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select(`
          *,
          product:products(name)
        `)
        .eq("vendor_id", vendorProfile.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, sender_type, message, message_type, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data as ChatMessage[]) || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: selectedConversation.id,
          sender_type: "vendor",
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

  const shareWhatsApp = async () => {
    if (!selectedConversation || !vendorProfile?.whatsapp) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: selectedConversation.id,
          sender_type: "vendor",
          message: vendorProfile.whatsapp,
          message_type: "whatsapp_share",
        });

      if (error) throw error;
      
      toast({
        title: "WhatsApp Shared",
        description: "Your WhatsApp number has been shared with the buyer.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to share WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="border-b border-border p-4">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Customer Chats
        </h2>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] min-h-[500px]">
        {/* Conversation List */}
        <div className="border-r border-border">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageCircle className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 text-left border-b border-border hover:bg-muted/50 transition-colors ${
                    selectedConversation?.id === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate">{conv.buyer_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {conv.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.buyer_email}
                  </p>
                  {conv.product && (
                    <p className="text-xs text-primary mt-1 truncate">
                      Re: {conv.product.name}
                    </p>
                  )}
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-border p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedConversation.buyer_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedConversation.buyer_email}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareWhatsApp}
                      disabled={!canShareWhatsApp || isSending}
                      className="gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Share WhatsApp
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!vendorProfile?.whatsapp
                      ? "Add WhatsApp number to your profile first"
                      : !canShareWhatsApp
                      ? "Upgrade to a paid plan to share WhatsApp"
                      : "Share your WhatsApp with this buyer"}
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 h-[350px]">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === "vendor" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.sender_type === "vendor"
                            ? "bg-primary text-primary-foreground"
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
                  ))}
                </div>
              </ScrollArea>

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
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
