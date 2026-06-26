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
      admin_activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          bg_color: string | null
          created_at: string
          cta_text: string | null
          cta_url: string | null
          display_order: number
          expires_at: string | null
          id: string
          is_active: boolean
          is_marquee: boolean
          message: string
          starts_at: string | null
          text_color: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_marquee?: boolean
          message: string
          starts_at?: string | null
          text_color?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_marquee?: boolean
          message?: string
          starts_at?: string | null
          text_color?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      banner_clicks: {
        Row: {
          banner_id: string | null
          clicked_at: string | null
          id: string
          page_path: string | null
        }
        Insert: {
          banner_id?: string | null
          clicked_at?: string | null
          id?: string
          page_path?: string | null
        }
        Update: {
          banner_id?: string | null
          clicked_at?: string | null
          id?: string
          page_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_clicks_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_impressions: {
        Row: {
          banner_id: string | null
          id: string
          page_path: string | null
          viewed_at: string
        }
        Insert: {
          banner_id?: string | null
          id?: string
          page_path?: string | null
          viewed_at?: string
        }
        Update: {
          banner_id?: string | null
          id?: string
          page_path?: string | null
          viewed_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          autoplay_duration: number | null
          bg_focal_x: number | null
          bg_focal_y: number | null
          btn_align: string | null
          btn_bg_color: string | null
          btn_border_color: string | null
          btn_border_radius: number | null
          btn_border_width: number | null
          btn_font_size: number | null
          btn_font_weight: string | null
          btn_full_width_mobile: boolean | null
          btn_italic: boolean | null
          btn_letter_spacing: number | null
          btn_padding_x: number | null
          btn_padding_y: number | null
          btn_shadow: boolean | null
          btn_text: string | null
          btn_text_color: string | null
          btn_url: string | null
          btn_visible: boolean | null
          content_h_align: string | null
          content_max_width: number | null
          content_padding_x: number | null
          content_padding_y: number | null
          content_v_align: string | null
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          display_order: number | null
          expires_at: string | null
          heading_color: string | null
          heading_font_family: string | null
          heading_font_size_desktop: number | null
          heading_font_size_mobile: number | null
          heading_font_weight: string | null
          heading_italic: boolean | null
          heading_letter_spacing: number | null
          heading_line_height: number | null
          heading_opacity: number | null
          heading_text: string | null
          heading_uppercase: boolean | null
          height_desktop: number | null
          height_mobile: number | null
          id: string
          image_mobile_url: string | null
          image_url: string | null
          is_active: boolean | null
          overlay_color: string | null
          overlay_gradient: boolean | null
          overlay_opacity: number | null
          starts_at: string | null
          subheading_color: string | null
          subheading_font_family: string | null
          subheading_font_size_desktop: number | null
          subheading_font_size_mobile: number | null
          subheading_font_weight: string | null
          subheading_italic: boolean | null
          subheading_letter_spacing: number | null
          subheading_opacity: number | null
          subheading_text: string | null
          subheading_uppercase: boolean | null
          subtitle: string | null
          text_color: string | null
          title: string | null
          transition: string | null
        }
        Insert: {
          autoplay_duration?: number | null
          bg_focal_x?: number | null
          bg_focal_y?: number | null
          btn_align?: string | null
          btn_bg_color?: string | null
          btn_border_color?: string | null
          btn_border_radius?: number | null
          btn_border_width?: number | null
          btn_font_size?: number | null
          btn_font_weight?: string | null
          btn_full_width_mobile?: boolean | null
          btn_italic?: boolean | null
          btn_letter_spacing?: number | null
          btn_padding_x?: number | null
          btn_padding_y?: number | null
          btn_shadow?: boolean | null
          btn_text?: string | null
          btn_text_color?: string | null
          btn_url?: string | null
          btn_visible?: boolean | null
          content_h_align?: string | null
          content_max_width?: number | null
          content_padding_x?: number | null
          content_padding_y?: number | null
          content_v_align?: string | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number | null
          expires_at?: string | null
          heading_color?: string | null
          heading_font_family?: string | null
          heading_font_size_desktop?: number | null
          heading_font_size_mobile?: number | null
          heading_font_weight?: string | null
          heading_italic?: boolean | null
          heading_letter_spacing?: number | null
          heading_line_height?: number | null
          heading_opacity?: number | null
          heading_text?: string | null
          heading_uppercase?: boolean | null
          height_desktop?: number | null
          height_mobile?: number | null
          id?: string
          image_mobile_url?: string | null
          image_url?: string | null
          is_active?: boolean | null
          overlay_color?: string | null
          overlay_gradient?: boolean | null
          overlay_opacity?: number | null
          starts_at?: string | null
          subheading_color?: string | null
          subheading_font_family?: string | null
          subheading_font_size_desktop?: number | null
          subheading_font_size_mobile?: number | null
          subheading_font_weight?: string | null
          subheading_italic?: boolean | null
          subheading_letter_spacing?: number | null
          subheading_opacity?: number | null
          subheading_text?: string | null
          subheading_uppercase?: boolean | null
          subtitle?: string | null
          text_color?: string | null
          title?: string | null
          transition?: string | null
        }
        Update: {
          autoplay_duration?: number | null
          bg_focal_x?: number | null
          bg_focal_y?: number | null
          btn_align?: string | null
          btn_bg_color?: string | null
          btn_border_color?: string | null
          btn_border_radius?: number | null
          btn_border_width?: number | null
          btn_font_size?: number | null
          btn_font_weight?: string | null
          btn_full_width_mobile?: boolean | null
          btn_italic?: boolean | null
          btn_letter_spacing?: number | null
          btn_padding_x?: number | null
          btn_padding_y?: number | null
          btn_shadow?: boolean | null
          btn_text?: string | null
          btn_text_color?: string | null
          btn_url?: string | null
          btn_visible?: boolean | null
          content_h_align?: string | null
          content_max_width?: number | null
          content_padding_x?: number | null
          content_padding_y?: number | null
          content_v_align?: string | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number | null
          expires_at?: string | null
          heading_color?: string | null
          heading_font_family?: string | null
          heading_font_size_desktop?: number | null
          heading_font_size_mobile?: number | null
          heading_font_weight?: string | null
          heading_italic?: boolean | null
          heading_letter_spacing?: number | null
          heading_line_height?: number | null
          heading_opacity?: number | null
          heading_text?: string | null
          heading_uppercase?: boolean | null
          height_desktop?: number | null
          height_mobile?: number | null
          id?: string
          image_mobile_url?: string | null
          image_url?: string | null
          is_active?: boolean | null
          overlay_color?: string | null
          overlay_gradient?: boolean | null
          overlay_opacity?: number | null
          starts_at?: string | null
          subheading_color?: string | null
          subheading_font_family?: string | null
          subheading_font_size_desktop?: number | null
          subheading_font_size_mobile?: number | null
          subheading_font_weight?: string | null
          subheading_italic?: boolean | null
          subheading_letter_spacing?: number | null
          subheading_opacity?: number | null
          subheading_text?: string | null
          subheading_uppercase?: boolean | null
          subtitle?: string | null
          text_color?: string | null
          title?: string | null
          transition?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          product_image_url: string | null
          product_name: string
          quantity: number
          unit_price: number
          updated_at: string
          user_id: string
          variant_colour: string | null
          variant_size: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_image_url?: string | null
          product_name: string
          quantity?: number
          unit_price: number
          updated_at?: string
          user_id: string
          variant_colour?: string | null
          variant_size?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_image_url?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
          variant_colour?: string | null
          variant_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          admin_notes: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          enquiry_ref: string | null
          follow_up_at: string | null
          followed_up_at: string | null
          id: string
          priority: string | null
          product_id: string | null
          product_name: string
          product_price: number | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          enquiry_ref?: string | null
          follow_up_at?: string | null
          followed_up_at?: string | null
          id?: string
          priority?: string | null
          product_id?: string | null
          product_name: string
          product_price?: number | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          enquiry_ref?: string | null
          follow_up_at?: string | null
          followed_up_at?: string | null
          id?: string
          priority?: string | null
          product_id?: string | null
          product_name?: string
          product_price?: number | null
          status?: string | null
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
      enquiry_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          product_price: number | null
          quantity: number
          selected_colour: string | null
          selected_size: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          product_price?: number | null
          quantity?: number
          selected_colour?: string | null
          selected_size?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          product_price?: number | null
          quantity?: number
          selected_colour?: string | null
          selected_size?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiry_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiry_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "enquiry_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiry_sessions: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          enquiry_ref: string | null
          id: string
          notes: string | null
          session_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          enquiry_ref?: string | null
          id?: string
          notes?: string | null
          session_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          enquiry_ref?: string | null
          id?: string
          notes?: string | null
          session_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          props: Json
          type: string
          updated_at: string
          visible_desktop: boolean
          visible_mobile: boolean
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          props?: Json
          type: string
          updated_at?: string
          visible_desktop?: boolean
          visible_mobile?: boolean
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          props?: Json
          type?: string
          updated_at?: string
          visible_desktop?: boolean
          visible_mobile?: boolean
        }
        Relationships: []
      }
      install_events: {
        Row: {
          event_type: string
          id: string
          occurred_at: string
          page_path: string | null
          platform: string | null
        }
        Insert: {
          event_type: string
          id?: string
          occurred_at?: string
          page_path?: string | null
          platform?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          occurred_at?: string
          page_path?: string | null
          platform?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image_url: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          variant_colour: string | null
          variant_size: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image_url?: string | null
          product_name: string
          quantity?: number
          total_price: number
          unit_price: number
          variant_colour?: string | null
          variant_size?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image_url?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_colour?: string | null
          variant_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          customer_pincode: string | null
          customer_state: string | null
          delivered_at: string | null
          id: string
          order_ref: string
          order_status: string
          payment_screenshot_url: string | null
          payment_status: string
          payment_upi_ref: string | null
          shipped_at: string | null
          shipping_amount: number
          subtotal: number
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          customer_pincode?: string | null
          customer_state?: string | null
          delivered_at?: string | null
          id?: string
          order_ref: string
          order_status?: string
          payment_screenshot_url?: string | null
          payment_status?: string
          payment_upi_ref?: string | null
          shipped_at?: string | null
          shipping_amount?: number
          subtotal?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_pincode?: string | null
          customer_state?: string | null
          delivered_at?: string | null
          id?: string
          order_ref?: string
          order_status?: string
          payment_screenshot_url?: string | null
          payment_status?: string
          payment_upi_ref?: string | null
          shipped_at?: string | null
          shipping_amount?: number
          subtotal?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          id: number
          updated_at: string
          upi_id: string | null
          upi_name: string | null
          upi_qr_url: string | null
        }
        Insert: {
          id?: number
          updated_at?: string
          upi_id?: string | null
          upi_name?: string | null
          upi_qr_url?: string | null
        }
        Update: {
          id?: number
          updated_at?: string
          upi_id?: string | null
          upi_name?: string | null
          upi_qr_url?: string | null
        }
        Relationships: []
      }
      pricing_components: {
        Row: {
          amount: number
          created_at: string
          id: string
          label: string
          section: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          label: string
          section: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          label?: string
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
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
      product_labels: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          slug: string
          tone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
          tone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          tone?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_views: {
        Row: {
          id: string
          product_id: string | null
          session_id: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
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
          colours: string[]
          created_at: string
          description: string | null
          discounted_price: number | null
          id: string
          is_featured: boolean
          is_visible: boolean
          name: string
          original_price: number
          sizes: string[]
          sku: string
          slug: string | null
          tags: string[]
        }
        Insert: {
          category_id?: string | null
          colours?: string[]
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          name: string
          original_price?: number
          sizes?: string[]
          sku?: string
          slug?: string | null
          tags?: string[]
        }
        Update: {
          category_id?: string | null
          colours?: string[]
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          name?: string
          original_price?: number
          sizes?: string[]
          sku?: string
          slug?: string | null
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
          city: string | null
          created_at: string
          current_mode: string
          email: string
          full_name: string | null
          id: string
          is_blocked: boolean
          phone: string | null
          profile_complete: boolean
          state: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          current_mode?: string
          email: string
          full_name?: string | null
          id: string
          is_blocked?: boolean
          phone?: string | null
          profile_complete?: boolean
          state?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          current_mode?: string
          email?: string
          full_name?: string | null
          id?: string
          is_blocked?: boolean
          phone?: string | null
          profile_complete?: boolean
          state?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          customer_city: string | null
          customer_email: string | null
          customer_name: string
          hidden_at: string | null
          hidden_by: string | null
          hide_reason: string | null
          id: string
          is_approved: boolean
          is_fake: boolean
          is_featured: boolean
          is_hidden: boolean
          product_id: string | null
          product_name: string | null
          rating: number
          review_text: string
          reviewer_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_city?: string | null
          customer_email?: string | null
          customer_name: string
          hidden_at?: string | null
          hidden_by?: string | null
          hide_reason?: string | null
          id?: string
          is_approved?: boolean
          is_fake?: boolean
          is_featured?: boolean
          is_hidden?: boolean
          product_id?: string | null
          product_name?: string | null
          rating: number
          review_text: string
          reviewer_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_city?: string | null
          customer_email?: string | null
          customer_name?: string
          hidden_at?: string | null
          hidden_by?: string | null
          hide_reason?: string | null
          id?: string
          is_approved?: boolean
          is_fake?: boolean
          is_featured?: boolean
          is_hidden?: boolean
          product_id?: string | null
          product_name?: string | null
          rating?: number
          review_text?: string
          reviewer_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_settings: {
        Row: {
          google_reviews_api_key: string | null
          id: number
          updated_at: string
        }
        Insert: {
          google_reviews_api_key?: string | null
          id?: number
          updated_at?: string
        }
        Update: {
          google_reviews_api_key?: string | null
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          about_body: string | null
          about_image_url: string | null
          about_title: string | null
          active_theme_id: string | null
          admin_brand_color: string | null
          admin_panel_title: string | null
          admin_welcome_message: string | null
          app_icon_url: string | null
          btn_border_radius: number | null
          btn_font_weight: string | null
          btn_letter_spacing: number | null
          btn_primary_bg: string | null
          btn_primary_text: string | null
          btn_secondary_bg: string | null
          btn_secondary_border: string | null
          btn_secondary_text: string | null
          card_border_color: string | null
          card_border_radius: number | null
          card_border_width: number | null
          card_layout: string | null
          card_shadow: string | null
          catalogue_download_label: string | null
          catalogue_heading: string | null
          catalogue_subtext: string | null
          catalogue_whatsapp_message_template: string | null
          category_empty_message: string | null
          category_pieces_label: string | null
          checkout_enabled: boolean | null
          color_accent: string | null
          color_background: string | null
          color_muted: string | null
          color_primary: string | null
          color_text: string | null
          container_max: number | null
          custom_domain: string | null
          domain_verified: boolean | null
          enquiry_button_color: string | null
          enquiry_mode: string
          enquiry_requires_login: boolean | null
          favicon_url: string | null
          font_body: string | null
          font_body_url: string | null
          font_heading: string | null
          font_heading_url: string | null
          font_size_base: number | null
          footer_copyright: string | null
          footer_links_visible: boolean | null
          footer_show_logo: boolean | null
          footer_show_social: boolean | null
          footer_show_whatsapp: boolean | null
          footer_tagline: string | null
          footer_whatsapp_label: string | null
          google_analytics_id: string | null
          google_place_id: string | null
          google_reviews_visible: boolean | null
          google_site_verification: string | null
          google_tag_manager_id: string | null
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
          line_height_base: number | null
          logo_url: string | null
          nav_catalogue_label: string | null
          nav_home_label: string | null
          nav_show_search: boolean | null
          order_confirmation_message: string | null
          packing_cost: number | null
          packing_cost_visible_to_admin: boolean | null
          pdf_footer_text: string | null
          pdf_primary_color: string | null
          pdf_store_name: string | null
          pdf_tagline: string | null
          policy_bg_color: string | null
          policy_cancellation_body: string | null
          policy_cancellation_title: string | null
          policy_font_family: string | null
          policy_font_size: string | null
          policy_heading_color: string | null
          policy_privacy_body: string | null
          policy_privacy_title: string | null
          policy_return_body: string | null
          policy_return_title: string | null
          policy_shipping_body: string | null
          policy_shipping_title: string | null
          policy_terms_body: string | null
          policy_terms_title: string | null
          policy_text_color: string | null
          pricing_mrp_multiplier: number
          pricing_sell_multiplier: number
          product_description_label: string | null
          product_enquiry_button_label: string | null
          product_grid_cols_desktop: number | null
          product_grid_cols_mobile: number | null
          product_grid_cols_tablet: number | null
          product_pdf_button_label: string | null
          product_related_title: string | null
          product_share_button_label: string | null
          product_tag_visible: boolean | null
          pwa_background_color: string | null
          pwa_description: string | null
          pwa_name: string | null
          pwa_short_name: string | null
          pwa_theme_color: string | null
          radius_base: number | null
          section_categories_title: string | null
          section_categories_visible: boolean | null
          section_featured_title: string | null
          section_featured_visible: boolean | null
          section_new_arrivals_title: string | null
          section_new_arrivals_visible: boolean | null
          section_sale_title: string | null
          section_sale_visible: boolean | null
          section_spacing: number | null
          section_trending_title: string | null
          section_trending_visible: boolean | null
          seo_auto_generate: boolean | null
          seo_brand_keywords: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_og_image_url: string | null
          seo_title: string | null
          shipping_charge: number | null
          shipping_free_above: number | null
          store_address: string | null
          store_city: string | null
          store_email: string | null
          store_name: string
          store_phone: string | null
          tagline: string
          updated_at: string
          usp_1: string | null
          usp_2: string | null
          usp_3: string | null
          usp_fade_speed_ms: number
          usp_interval_ms: number
          whatsapp_float_visible: boolean
          whatsapp_message_template: string | null
          whatsapp_number: string | null
        }
        Insert: {
          about_body?: string | null
          about_image_url?: string | null
          about_title?: string | null
          active_theme_id?: string | null
          admin_brand_color?: string | null
          admin_panel_title?: string | null
          admin_welcome_message?: string | null
          app_icon_url?: string | null
          btn_border_radius?: number | null
          btn_font_weight?: string | null
          btn_letter_spacing?: number | null
          btn_primary_bg?: string | null
          btn_primary_text?: string | null
          btn_secondary_bg?: string | null
          btn_secondary_border?: string | null
          btn_secondary_text?: string | null
          card_border_color?: string | null
          card_border_radius?: number | null
          card_border_width?: number | null
          card_layout?: string | null
          card_shadow?: string | null
          catalogue_download_label?: string | null
          catalogue_heading?: string | null
          catalogue_subtext?: string | null
          catalogue_whatsapp_message_template?: string | null
          category_empty_message?: string | null
          category_pieces_label?: string | null
          checkout_enabled?: boolean | null
          color_accent?: string | null
          color_background?: string | null
          color_muted?: string | null
          color_primary?: string | null
          color_text?: string | null
          container_max?: number | null
          custom_domain?: string | null
          domain_verified?: boolean | null
          enquiry_button_color?: string | null
          enquiry_mode?: string
          enquiry_requires_login?: boolean | null
          favicon_url?: string | null
          font_body?: string | null
          font_body_url?: string | null
          font_heading?: string | null
          font_heading_url?: string | null
          font_size_base?: number | null
          footer_copyright?: string | null
          footer_links_visible?: boolean | null
          footer_show_logo?: boolean | null
          footer_show_social?: boolean | null
          footer_show_whatsapp?: boolean | null
          footer_tagline?: string | null
          footer_whatsapp_label?: string | null
          google_analytics_id?: string | null
          google_place_id?: string | null
          google_reviews_visible?: boolean | null
          google_site_verification?: string | null
          google_tag_manager_id?: string | null
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
          line_height_base?: number | null
          logo_url?: string | null
          nav_catalogue_label?: string | null
          nav_home_label?: string | null
          nav_show_search?: boolean | null
          order_confirmation_message?: string | null
          packing_cost?: number | null
          packing_cost_visible_to_admin?: boolean | null
          pdf_footer_text?: string | null
          pdf_primary_color?: string | null
          pdf_store_name?: string | null
          pdf_tagline?: string | null
          policy_bg_color?: string | null
          policy_cancellation_body?: string | null
          policy_cancellation_title?: string | null
          policy_font_family?: string | null
          policy_font_size?: string | null
          policy_heading_color?: string | null
          policy_privacy_body?: string | null
          policy_privacy_title?: string | null
          policy_return_body?: string | null
          policy_return_title?: string | null
          policy_shipping_body?: string | null
          policy_shipping_title?: string | null
          policy_terms_body?: string | null
          policy_terms_title?: string | null
          policy_text_color?: string | null
          pricing_mrp_multiplier?: number
          pricing_sell_multiplier?: number
          product_description_label?: string | null
          product_enquiry_button_label?: string | null
          product_grid_cols_desktop?: number | null
          product_grid_cols_mobile?: number | null
          product_grid_cols_tablet?: number | null
          product_pdf_button_label?: string | null
          product_related_title?: string | null
          product_share_button_label?: string | null
          product_tag_visible?: boolean | null
          pwa_background_color?: string | null
          pwa_description?: string | null
          pwa_name?: string | null
          pwa_short_name?: string | null
          pwa_theme_color?: string | null
          radius_base?: number | null
          section_categories_title?: string | null
          section_categories_visible?: boolean | null
          section_featured_title?: string | null
          section_featured_visible?: boolean | null
          section_new_arrivals_title?: string | null
          section_new_arrivals_visible?: boolean | null
          section_sale_title?: string | null
          section_sale_visible?: boolean | null
          section_spacing?: number | null
          section_trending_title?: string | null
          section_trending_visible?: boolean | null
          seo_auto_generate?: boolean | null
          seo_brand_keywords?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_og_image_url?: string | null
          seo_title?: string | null
          shipping_charge?: number | null
          shipping_free_above?: number | null
          store_address?: string | null
          store_city?: string | null
          store_email?: string | null
          store_name?: string
          store_phone?: string | null
          tagline?: string
          updated_at?: string
          usp_1?: string | null
          usp_2?: string | null
          usp_3?: string | null
          usp_fade_speed_ms?: number
          usp_interval_ms?: number
          whatsapp_float_visible?: boolean
          whatsapp_message_template?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          about_body?: string | null
          about_image_url?: string | null
          about_title?: string | null
          active_theme_id?: string | null
          admin_brand_color?: string | null
          admin_panel_title?: string | null
          admin_welcome_message?: string | null
          app_icon_url?: string | null
          btn_border_radius?: number | null
          btn_font_weight?: string | null
          btn_letter_spacing?: number | null
          btn_primary_bg?: string | null
          btn_primary_text?: string | null
          btn_secondary_bg?: string | null
          btn_secondary_border?: string | null
          btn_secondary_text?: string | null
          card_border_color?: string | null
          card_border_radius?: number | null
          card_border_width?: number | null
          card_layout?: string | null
          card_shadow?: string | null
          catalogue_download_label?: string | null
          catalogue_heading?: string | null
          catalogue_subtext?: string | null
          catalogue_whatsapp_message_template?: string | null
          category_empty_message?: string | null
          category_pieces_label?: string | null
          checkout_enabled?: boolean | null
          color_accent?: string | null
          color_background?: string | null
          color_muted?: string | null
          color_primary?: string | null
          color_text?: string | null
          container_max?: number | null
          custom_domain?: string | null
          domain_verified?: boolean | null
          enquiry_button_color?: string | null
          enquiry_mode?: string
          enquiry_requires_login?: boolean | null
          favicon_url?: string | null
          font_body?: string | null
          font_body_url?: string | null
          font_heading?: string | null
          font_heading_url?: string | null
          font_size_base?: number | null
          footer_copyright?: string | null
          footer_links_visible?: boolean | null
          footer_show_logo?: boolean | null
          footer_show_social?: boolean | null
          footer_show_whatsapp?: boolean | null
          footer_tagline?: string | null
          footer_whatsapp_label?: string | null
          google_analytics_id?: string | null
          google_place_id?: string | null
          google_reviews_visible?: boolean | null
          google_site_verification?: string | null
          google_tag_manager_id?: string | null
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
          line_height_base?: number | null
          logo_url?: string | null
          nav_catalogue_label?: string | null
          nav_home_label?: string | null
          nav_show_search?: boolean | null
          order_confirmation_message?: string | null
          packing_cost?: number | null
          packing_cost_visible_to_admin?: boolean | null
          pdf_footer_text?: string | null
          pdf_primary_color?: string | null
          pdf_store_name?: string | null
          pdf_tagline?: string | null
          policy_bg_color?: string | null
          policy_cancellation_body?: string | null
          policy_cancellation_title?: string | null
          policy_font_family?: string | null
          policy_font_size?: string | null
          policy_heading_color?: string | null
          policy_privacy_body?: string | null
          policy_privacy_title?: string | null
          policy_return_body?: string | null
          policy_return_title?: string | null
          policy_shipping_body?: string | null
          policy_shipping_title?: string | null
          policy_terms_body?: string | null
          policy_terms_title?: string | null
          policy_text_color?: string | null
          pricing_mrp_multiplier?: number
          pricing_sell_multiplier?: number
          product_description_label?: string | null
          product_enquiry_button_label?: string | null
          product_grid_cols_desktop?: number | null
          product_grid_cols_mobile?: number | null
          product_grid_cols_tablet?: number | null
          product_pdf_button_label?: string | null
          product_related_title?: string | null
          product_share_button_label?: string | null
          product_tag_visible?: boolean | null
          pwa_background_color?: string | null
          pwa_description?: string | null
          pwa_name?: string | null
          pwa_short_name?: string | null
          pwa_theme_color?: string | null
          radius_base?: number | null
          section_categories_title?: string | null
          section_categories_visible?: boolean | null
          section_featured_title?: string | null
          section_featured_visible?: boolean | null
          section_new_arrivals_title?: string | null
          section_new_arrivals_visible?: boolean | null
          section_sale_title?: string | null
          section_sale_visible?: boolean | null
          section_spacing?: number | null
          section_trending_title?: string | null
          section_trending_visible?: boolean | null
          seo_auto_generate?: boolean | null
          seo_brand_keywords?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_og_image_url?: string | null
          seo_title?: string | null
          shipping_charge?: number | null
          shipping_free_above?: number | null
          store_address?: string | null
          store_city?: string | null
          store_email?: string | null
          store_name?: string
          store_phone?: string | null
          tagline?: string
          updated_at?: string
          usp_1?: string | null
          usp_2?: string | null
          usp_3?: string | null
          usp_fade_speed_ms?: number
          usp_interval_ms?: number
          whatsapp_float_visible?: boolean
          whatsapp_message_template?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_active_theme_id_fkey"
            columns: ["active_theme_id"]
            isOneToOne: false
            referencedRelation: "theme_presets"
            referencedColumns: ["id"]
          },
        ]
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
      theme_presets: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_builtin: boolean
          name: string
          tokens: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_builtin?: boolean
          name: string
          tokens?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_builtin?: boolean
          name?: string
          tokens?: Json
          updated_at?: string
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
      whatsapp_clicks: {
        Row: {
          clicked_at: string | null
          id: string
          product_id: string | null
          source: string | null
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          product_id?: string | null
          source?: string | null
        }
        Update: {
          clicked_at?: string | null
          id?: string
          product_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          note: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      lookup_enquiry_by_ref: {
        Args: { _ref: string }
        Returns: {
          created_at: string
          customer_name: string
          enquiry_ref: string
          id: string
          items: Json
          notes: string
          status: string
        }[]
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
