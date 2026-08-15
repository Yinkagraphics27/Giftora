export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      buyer_inquiries: {
        Row: {
          buyer_email: string
          buyer_name: string
          buyer_phone: string | null
          created_at: string
          id: string
          inquiry_type: string
          message: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          buyer_email: string
          buyer_name: string
          buyer_phone?: string | null
          created_at?: string
          id?: string
          inquiry_type?: string
          message: string
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string | null
          created_at?: string
          id?: string
          inquiry_type?: string
          message?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_inquiries_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_inquiries_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          buyer_email: string
          buyer_name: string
          buyer_phone: string | null
          created_at: string
          id: string
          product_id: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          buyer_email: string
          buyer_name: string
          buyer_phone?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          message_type: string
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          message_type?: string
          sender_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          admin_review_notes: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_vendor_deal: boolean
          minimum_order_quantity: number | null
          name: string
          price_max: number | null
          price_min: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          trade_price: number | null
          updated_at: string
          vendor_id: string
          vendor_notes: string | null
        }
        Insert: {
          admin_review_notes?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_vendor_deal?: boolean
          minimum_order_quantity?: number | null
          name: string
          price_max?: number | null
          price_min: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          trade_price?: number | null
          updated_at?: string
          vendor_id: string
          vendor_notes?: string | null
        }
        Update: {
          admin_review_notes?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_vendor_deal?: boolean
          minimum_order_quantity?: number | null
          name?: string
          price_max?: number | null
          price_min?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          trade_price?: number | null
          updated_at?: string
          vendor_id?: string
          vendor_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_inquiries: {
        Row: {
          created_at: string
          id: string
          message: string | null
          product_id: string
          quantity: number
          requester_vendor_id: string
          seller_vendor_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          product_id: string
          quantity: number
          requester_vendor_id: string
          seller_vendor_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          product_id?: string
          quantity?: number
          requester_vendor_id?: string
          seller_vendor_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_inquiries_requester_vendor_id_fkey"
            columns: ["requester_vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_inquiries_requester_vendor_id_fkey"
            columns: ["requester_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_inquiries_seller_vendor_id_fkey"
            columns: ["seller_vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_inquiries_seller_vendor_id_fkey"
            columns: ["seller_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          payment_type: string
          paystack_reference: string | null
          vendor_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          payment_type: string
          paystack_reference?: string | null
          vendor_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          payment_type?: string
          paystack_reference?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          business_name: string
          city: string
          country: string
          created_at: string
          description: string | null
          email: string
          free_month_earned: boolean | null
          id: string
          is_launch_partner: boolean
          is_trusted_vendor: boolean | null
          is_verified: boolean
          logo_url: string | null
          paystack_authorization_code: string | null
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          phone: string | null
          products_reviewed_count: number | null
          status: string
          subscription_expires_at: string | null
          subscription_pause_days_used: number | null
          subscription_paused_at: string | null
          subscription_status: string
          subscription_tier: string
          updated_at: string
          user_id: string
          vendor_type: string
          whatsapp: string | null
        }
        Insert: {
          business_name: string
          city: string
          country: string
          created_at?: string
          description?: string | null
          email: string
          free_month_earned?: boolean | null
          id?: string
          is_launch_partner?: boolean
          is_trusted_vendor?: boolean | null
          is_verified?: boolean
          logo_url?: string | null
          paystack_authorization_code?: string | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          phone?: string | null
          products_reviewed_count?: number | null
          status?: string
          subscription_expires_at?: string | null
          subscription_pause_days_used?: number | null
          subscription_paused_at?: string | null
          subscription_status?: string
          subscription_tier?: string
          updated_at?: string
          user_id: string
          vendor_type?: string
          whatsapp?: string | null
        }
        Update: {
          business_name?: string
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          email?: string
          free_month_earned?: boolean | null
          id?: string
          is_launch_partner?: boolean
          is_trusted_vendor?: boolean | null
          is_verified?: boolean
          logo_url?: string | null
          paystack_authorization_code?: string | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          phone?: string | null
          products_reviewed_count?: number | null
          status?: string
          subscription_expires_at?: string | null
          subscription_pause_days_used?: number | null
          subscription_paused_at?: string | null
          subscription_status?: string
          subscription_tier?: string
          updated_at?: string
          user_id?: string
          vendor_type?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          is_vendor_deal: boolean | null
          name: string | null
          price_max: number | null
          price_min: number | null
          status: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_vendor_profiles: {
        Row: {
          business_name: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_launch_partner: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          vendor_type: string | null
        }
        Insert: {
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_launch_partner?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          vendor_type?: string | null
        }
        Update: {
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_launch_partner?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          vendor_type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
