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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target_email: string | null
          target_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_email?: string | null
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_email?: string | null
          target_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_visible: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_visible?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_visible?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string | null
          id: string
          product_id: string | null
          product_name: string
          product_price: number | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          product_id?: string | null
          product_name: string
          product_price?: number | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          discounted_price: number | null
          id: string
          is_featured: boolean
          is_visible: boolean
          name: string
          original_price: number
          sku: string
          tags: string[]
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          name: string
          original_price?: number
          sku?: string
          tags?: string[]
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          name?: string
          original_price?: number
          sku?: string
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_blocked: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_blocked?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_blocked?: boolean
        }
        Relationships: []
      }
      settings: {
        Row: {
          admin_brand_color: string | null
          admin_panel_title: string | null
          admin_welcome_message: string | null
          announcement_bg_color: string | null
          announcement_dismissible: boolean | null
          announcement_text: string | null
          announcement_text_color: string | null
          announcement_visible: boolean | null
          catalogue_download_label: string | null
          catalogue_heading: string | null
          catalogue_subtext: string | null
          category_empty_message: string | null
          category_pieces_label: string | null
          color_accent: string | null
          color_background: string | null
          color_primary: string | null
          color_text: string | null
          enquiry_button_color: string | null
          favicon_url: string | null
          footer_copyright: string | null
          footer_links_visible: boolean | null
          footer_show_logo: boolean | null
          footer_show_social: boolean | null
          footer_show_whatsapp: boolean | null
          footer_tagline: string | null
          footer_whatsapp_label: string | null
          hero_cta_label: string | null
          hero_cta_url: string | null
          hero_headline: string | null
          hero_image_url: string | null
          hero_overlay_opacity: number | null
          hero_subtext: string | null
          id: number
          install_prompt_button_label: string | null
          install_prompt_text: string | null
          install_prompt_visible: boolean | null
          logo_url: string | null
          nav_catalogue_label: string | null
          nav_home_label: string | null
          nav_show_search: boolean | null
          pdf_footer_text: string | null
          pdf_primary_color: string | null
          pdf_store_name: string | null
          pdf_tagline: string | null
          product_description_label: string | null
          product_enquiry_button_label: string | null
          product_pdf_button_label: string | null
          product_related_title: string | null
          product_share_button_label: string | null
          product_tag_visible: boolean | null
          pwa_background_color: string | null
          pwa_description: string | null
          pwa_name: string | null
          pwa_short_name: string | null
          pwa_theme_color: string | null
          section_categories_title: string | null
          section_categories_visible: boolean | null
          section_featured_title: string | null
          section_featured_visible: boolean | null
          section_new_arrivals_title: string | null
          section_new_arrivals_visible: boolean | null
          section_sale_title: string | null
          section_sale_visible: boolean | null
          section_trending_title: string | null
          section_trending_visible: boolean | null
          seo_description: string | null
          seo_og_image_url: string | null
          seo_title: string | null
          store_address: string | null
          store_city: string | null
          store_email: string | null
          store_name: string
          store_phone: string | null
          tagline: string
          updated_at: string
          usp_fade_speed_ms: number
          usp_interval_ms: number
          whatsapp_message_template: string | null
          whatsapp_number: string | null
        }
        Insert: {
          admin_brand_color?: string | null
          admin_panel_title?: string | null
          admin_welcome_message?: string | null
          announcement_bg_color?: string | null
          announcement_dismissible?: boolean | null
          announcement_text?: string | null
          announcement_text_color?: string | null
          announcement_visible?: boolean | null
          catalogue_download_label?: string | null
          catalogue_heading?: string | null
          catalogue_subtext?: string | null
          category_empty_message?: string | null
          category_pieces_label?: string | null
          color_accent?: string | null
          color_background?: string | null
          color_primary?: string | null
          color_text?: string | null
          enquiry_button_color?: string | null
          favicon_url?: string | null
          footer_copyright?: string | null
          footer_links_visible?: boolean | null
          footer_show_logo?: boolean | null
          footer_show_social?: boolean | null
          footer_show_whatsapp?: boolean | null
          footer_tagline?: string | null
          footer_whatsapp_label?: string | null
          hero_cta_label?: string | null
          hero_cta_url?: string | null
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_overlay_opacity?: number | null
          hero_subtext?: string | null
          id?: number
          install_prompt_button_label?: string | null
          install_prompt_text?: string | null
          install_prompt_visible?: boolean | null
          logo_url?: string | null
          nav_catalogue_label?: string | null
          nav_home_label?: string | null
          nav_show_search?: boolean | null
          pdf_footer_text?: string | null
          pdf_primary_color?: string | null
          pdf_store_name?: string | null
          pdf_tagline?: string | null
          product_description_label?: string | null
          product_enquiry_button_label?: string | null
          product_pdf_button_label?: string | null
          product_related_title?: string | null
          product_share_button_label?: string | null
          product_tag_visible?: boolean | null
          pwa_background_color?: string | null
          pwa_description?: string | null
          pwa_name?: string | null
          pwa_short_name?: string | null
          pwa_theme_color?: string | null
          section_categories_title?: string | null
          section_categories_visible?: boolean | null
          section_featured_title?: string | null
          section_featured_visible?: boolean | null
          section_new_arrivals_title?: string | null
          section_new_arrivals_visible?: boolean | null
          section_sale_title?: string | null
          section_sale_visible?: boolean | null
          section_trending_title?: string | null
          section_trending_visible?: boolean | null
          seo_description?: string | null
          seo_og_image_url?: string | null
          seo_title?: string | null
          store_address?: string | null
          store_city?: string | null
          store_email?: string | null
          store_name?: string
          store_phone?: string | null
          tagline?: string
          updated_at?: string
          usp_fade_speed_ms?: number
          usp_interval_ms?: number
          whatsapp_message_template?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          admin_brand_color?: string | null
          admin_panel_title?: string | null
          admin_welcome_message?: string | null
          announcement_bg_color?: string | null
          announcement_dismissible?: boolean | null
          announcement_text?: string | null
          announcement_text_color?: string | null
          announcement_visible?: boolean | null
          catalogue_download_label?: string | null
          catalogue_heading?: string | null
          catalogue_subtext?: string | null
          category_empty_message?: string | null
          category_pieces_label?: string | null
          color_accent?: string | null
          color_background?: string | null
          color_primary?: string | null
          color_text?: string | null
          enquiry_button_color?: string | null
          favicon_url?: string | null
          footer_copyright?: string | null
          footer_links_visible?: boolean | null
          footer_show_logo?: boolean | null
          footer_show_social?: boolean | null
          footer_show_whatsapp?: boolean | null
          footer_tagline?: string | null
          footer_whatsapp_label?: string | null
          hero_cta_label?: string | null
          hero_cta_url?: string | null
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_overlay_opacity?: number | null
          hero_subtext?: string | null
          id?: number
          install_prompt_button_label?: string | null
          install_prompt_text?: string | null
          install_prompt_visible?: boolean | null
          logo_url?: string | null
          nav_catalogue_label?: string | null
          nav_home_label?: string | null
          nav_show_search?: boolean | null
          pdf_footer_text?: string | null
          pdf_primary_color?: string | null
          pdf_store_name?: string | null
          pdf_tagline?: string | null
          product_description_label?: string | null
          product_enquiry_button_label?: string | null
          product_pdf_button_label?: string | null
          product_related_title?: string | null
          product_share_button_label?: string | null
          product_tag_visible?: boolean | null
          pwa_background_color?: string | null
          pwa_description?: string | null
          pwa_name?: string | null
          pwa_short_name?: string | null
          pwa_theme_color?: string | null
          section_categories_title?: string | null
          section_categories_visible?: boolean | null
          section_featured_title?: string | null
          section_featured_visible?: boolean | null
          section_new_arrivals_title?: string | null
          section_new_arrivals_visible?: boolean | null
          section_sale_title?: string | null
          section_sale_visible?: boolean | null
          section_trending_title?: string | null
          section_trending_visible?: boolean | null
          seo_description?: string | null
          seo_og_image_url?: string | null
          seo_title?: string | null
          store_address?: string | null
          store_city?: string | null
          store_email?: string | null
          store_name?: string
          store_phone?: string | null
          tagline?: string
          updated_at?: string
          usp_fade_speed_ms?: number
          usp_interval_ms?: number
          whatsapp_message_template?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          platform: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          platform: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          platform?: string
          url?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_product_sku: { Args: { _for?: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user" | "manager" | "customer"
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
      app_role: ["admin", "user", "manager", "customer"],
    },
  },
} as const
