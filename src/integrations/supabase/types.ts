export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          allow_half_half: boolean | null
          category_type: string | null
          created_at: string | null
          half_half_price_rule: string | null
          has_portions: boolean | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string
          order: number | null
          portions_label: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_half_half?: boolean | null
          category_type?: string | null
          created_at?: string | null
          half_half_price_rule?: string | null
          has_portions?: boolean | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          name: string
          order?: number | null
          portions_label?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_half_half?: boolean | null
          category_type?: string | null
          created_at?: string | null
          half_half_price_rule?: string | null
          has_portions?: boolean | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          name?: string
          order?: number | null
          portions_label?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      complement_groups: {
        Row: {
          created_at: string | null
          group_type: string
          id: number
          image_url: string | null
          is_active: boolean
          is_required: boolean | null
          maximum_quantity: number | null
          minimum_quantity: number | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_type: string
          id?: number
          image_url?: string | null
          is_active?: boolean
          is_required?: boolean | null
          maximum_quantity?: number | null
          minimum_quantity?: number | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_type?: string
          id?: number
          image_url?: string | null
          is_active?: boolean
          is_required?: boolean | null
          maximum_quantity?: number | null
          minimum_quantity?: number | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      complement_items: {
        Row: {
          created_at: string | null
          group_id: number
          id: number
          is_active: boolean
          name: string
          order: number | null
          price: number | null
          product_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id: number
          id?: number
          is_active?: boolean
          name: string
          order?: number | null
          price?: number | null
          product_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: number
          id?: number
          is_active?: boolean
          name?: string
          order?: number | null
          price?: number | null
          product_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complement_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "complement_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complement_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      complements: {
        Row: {
          created_at: string | null
          has_stock_control: boolean | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          has_stock_control?: boolean | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          has_stock_control?: boolean | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_complement_groups: {
        Row: {
          complement_group_id: number
          created_at: string | null
          id: number
          is_required: boolean | null
          order: number | null
          product_id: number
          user_id: string | null
        }
        Insert: {
          complement_group_id: number
          created_at?: string | null
          id?: number
          is_required?: boolean | null
          order?: number | null
          product_id: number
          user_id?: string | null
        }
        Update: {
          complement_group_id?: number
          created_at?: string | null
          id?: number
          is_required?: boolean | null
          order?: number | null
          product_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_complement_groups_complement_group_id_fkey"
            columns: ["complement_group_id"]
            isOneToOne: false
            referencedRelation: "complement_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_complement_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_complements: {
        Row: {
          complement_id: number | null
          created_at: string | null
          id: number
          product_id: number | null
          user_id: string
        }
        Insert: {
          complement_id?: number | null
          created_at?: string | null
          id?: number
          product_id?: number | null
          user_id: string
        }
        Update: {
          complement_id?: number | null
          created_at?: string | null
          id?: number
          product_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_complements_complement_id_fkey"
            columns: ["complement_id"]
            isOneToOne: false
            referencedRelation: "complements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_complements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          created_at: string | null
          id: number
          is_default: boolean
          name: string
          price: number
          product_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_default?: boolean
          name: string
          price: number
          product_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_default?: boolean
          name?: string
          price?: number
          product_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specific_complements: {
        Row: {
          complement_group_id: number
          complement_id: number
          created_at: string | null
          custom_price: number | null
          id: number
          is_active: boolean | null
          order: number | null
          product_id: number
          user_id: string | null
        }
        Insert: {
          complement_group_id: number
          complement_id: number
          created_at?: string | null
          custom_price?: number | null
          id?: number
          is_active?: boolean | null
          order?: number | null
          product_id: number
          user_id?: string | null
        }
        Update: {
          complement_group_id?: number
          complement_id?: number
          created_at?: string | null
          custom_price?: number | null
          id?: number
          is_active?: boolean | null
          order?: number | null
          product_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_specific_complements_complement_group_id_fkey"
            columns: ["complement_group_id"]
            isOneToOne: false
            referencedRelation: "complement_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specific_complements_complement_id_fkey"
            columns: ["complement_id"]
            isOneToOne: false
            referencedRelation: "complements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specific_complements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          allow_half_half: boolean | null
          category_id: number | null
          created_at: string | null
          description: string | null
          dietary_restrictions: string[] | null
          display_order: number | null
          half_half_price_rule: string | null
          has_stock_control: boolean | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string
          pdv_code: string | null
          portion_size: string | null
          price: number
          product_type_id: number | null
          serves_count: number | null
          stock_quantity: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_half_half?: boolean | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          dietary_restrictions?: string[] | null
          display_order?: number | null
          half_half_price_rule?: string | null
          has_stock_control?: boolean | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          name: string
          pdv_code?: string | null
          portion_size?: string | null
          price: number
          product_type_id?: number | null
          serves_count?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_half_half?: boolean | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          dietary_restrictions?: string[] | null
          display_order?: number | null
          half_half_price_rule?: string | null
          has_stock_control?: boolean | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          name?: string
          pdv_code?: string | null
          portion_size?: string | null
          price?: number
          product_type_id?: number | null
          serves_count?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          menu_name: string | null
          restaurant_address: string | null
          slogan: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          menu_name?: string | null
          restaurant_address?: string | null
          slogan?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          menu_name?: string | null
          restaurant_address?: string | null
          slogan?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          price_id: string | null
          status: string
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          price_id?: string | null
          status: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          price_id?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_helper_functions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      delete_product_complements: {
        Args: { product_id_param: number }
        Returns: undefined
      }
      get_all_complements: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          has_stock_control: boolean | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string | null
          user_id: string
        }[]
      }
      get_product_complements: {
        Args: { product_id_param: number }
        Returns: {
          complement_id: number | null
          created_at: string | null
          id: number
          product_id: number | null
          user_id: string
        }[]
      }
      get_product_sizes: {
        Args: { product_id_param: number }
        Returns: {
          created_at: string | null
          id: number
          is_default: boolean
          name: string
          price: number
          product_id: number | null
          updated_at: string | null
        }[]
      }
      get_product_specific_complements: {
        Args: { product_id_param: number; group_id_param: number }
        Returns: {
          id: number
          product_id: number
          complement_group_id: number
          complement_id: number
          is_active: boolean
          custom_price: number
          complement_name: string
          complement_default_price: number
        }[]
      }
      initialize_product_specific_complements: {
        Args: {
          product_id_param: number
          group_id_param: number
          user_id_param: string
        }
        Returns: undefined
      }
      insert_product_complement: {
        Args: {
          product_id_param: number
          complement_id_param: number
          user_id_param: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
